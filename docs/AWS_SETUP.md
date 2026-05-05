# Configuración de AWS - Panini App

## Pre-requisitos

1. **Cuenta AWS**
   - Crear en https://aws.amazon.com
   - Credit card requerida
   - Verificación de identidad

2. **Credenciales IAM**
   ```
   - Crear usuario IAM para desarrollo
   - NO usar root account
   - Generar Access Key ID + Secret Access Key
   - Guardar en AWS Secrets Manager o .env (nunca en Git)
   ```

3. **AWS CLI**
   ```bash
   # Install
   curl "https://awscli.amazonaws.com/awscli-exe-windows-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   .\aws\install
   
   # Configure
   aws configure
   # Ingresar Access Key, Secret Key, región (us-east-1), formato (json)
   ```

4. **Terraform**
   ```bash
   # Windows con Chocolatey
   choco install terraform
   
   # O descargar desde https://www.terraform.io/downloads.html
   ```

5. **Docker**
   ```bash
   # Descargar Docker Desktop
   # Incluye Docker CLI y Docker Compose
   ```

---

## 1. Arquitectura de Redes (VPC)

### VPC Configuration

```hcl
# infrastructure/vpc.tf

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "panini-vpc-${var.environment}"
  }
}

# Public Subnets (ALB)
resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = { Name = "panini-public-1" }
}

resource "aws_subnet" "public_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = { Name = "panini-public-2" }
}

# Private Subnets (RDS, ElastiCache, ECS)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = { Name = "panini-private-1" }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = { Name = "panini-private-2" }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "panini-igw" }
}

# Route table público
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = { Name = "panini-public-rt" }
}

# Asociar subnets públicas con route table
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# NAT Gateway (para salida de subnets privadas)
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "panini-nat-eip" }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  tags = { Name = "panini-nat" }
  
  depends_on = [aws_internet_gateway.main]
}

# Route table privado
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = { Name = "panini-private-rt" }
}

# Asociar subnets privadas
resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}
```

### Security Groups

```hcl
# Infrastructure/sg.tf

# ALB Security Group
resource "aws_security_group" "alb" {
  name   = "panini-alb-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ECS Security Group
resource "aws_security_group" "ecs" {
  name   = "panini-ecs-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name   = "panini-rds-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ElastiCache Security Group
resource "aws_security_group" "redis" {
  name   = "panini-redis-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

## 2. Base de Datos (RDS PostgreSQL)

```hcl
# infrastructure/rds.tf

resource "aws_db_subnet_group" "main" {
  name       = "panini-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_rds_cluster" "main" {
  cluster_identifier      = "panini-cluster-${var.environment}"
  engine                  = "aurora-postgresql"
  engine_version          = "14.6"
  database_name           = "panini"
  master_username         = var.db_username
  master_password         = random_password.db.result
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  backup_retention_period = var.backup_retention
  skip_final_snapshot     = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "prod" ? "panini-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = { Name = "panini-aurora" }
}

resource "aws_rds_cluster_instance" "main" {
  count              = 2
  identifier         = "panini-instance-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = var.db_instance_class
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  performance_insights_enabled = var.environment == "prod" ? true : false
}

# Generar password aleatorio
resource "random_password" "db" {
  length  = 32
  special = true
}

# Almacenar password en Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "panini/db/password-${var.environment}"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id       = aws_secretsmanager_secret.db_password.id
  secret_string   = random_password.db.result
}

# Outputs
output "rds_endpoint" {
  value = aws_rds_cluster.main.endpoint
}

output "rds_reader_endpoint" {
  value = aws_rds_cluster.main.reader_endpoint
}
```

---

## 3. Cache (ElastiCache Redis)

```hcl
# infrastructure/redis.tf

resource "aws_elasticache_subnet_group" "main" {
  name       = "panini-redis-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "panini-redis-${var.environment}"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = var.redis_num_nodes
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  
  automatic_failover_enabled = var.environment == "prod" ? true : false
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth.result

  tags = { Name = "panini-redis" }
}

resource "random_password" "redis_auth" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "redis_auth" {
  name = "panini/redis/auth-${var.environment}"
}

resource "aws_secretsmanager_secret_version" "redis_auth" {
  secret_id     = aws_secretsmanager_secret.redis_auth.id
  secret_string = random_password.redis_auth.result
}

# Outputs
output "redis_endpoint" {
  value = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "redis_port" {
  value = aws_elasticache_cluster.main.port
}
```

---

## 4. Container Registry (ECR)

```hcl
# infrastructure/ecr.tf

resource "aws_ecr_repository" "api" {
  name                 = "panini/api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = { Name = "panini-api-repo" }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Outputs
output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}
```

---

## 5. Application Load Balancer (ALB)

```hcl
# infrastructure/alb.tf

resource "aws_lb" "main" {
  name               = "panini-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  enable_deletion_protection = var.environment == "prod" ? true : false

  tags = { Name = "panini-alb" }
}

resource "aws_lb_target_group" "api" {
  name        = "panini-api-tg-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  tags = { Name = "panini-api-tg" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# SSL Certificate
resource "aws_acm_certificate" "main" {
  domain_name       = var.api_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = "panini-api-cert" }
}

# Outputs
output "alb_dns" {
  value = aws_lb.main.dns_name
}
```

---

## 6. Container Service (ECS Fargate)

```hcl
# infrastructure/ecs.tf

resource "aws_ecs_cluster" "main" {
  name = "panini-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Name = "panini-ecs-cluster" }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "panini-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task Role (para acceder a S3, Secrets Manager, etc)
resource "aws_iam_role" "ecs_task_role" {
  name = "panini-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "panini-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "api"
    image     = "${aws_ecr_repository.api.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    
    environment = [
      {
        name  = "NODE_ENV"
        value = var.environment
      },
      {
        name  = "DB_HOST"
        value = aws_rds_cluster.main.endpoint
      },
      {
        name  = "DB_NAME"
        value = "panini"
      },
      {
        name  = "REDIS_HOST"
        value = aws_elasticache_cluster.main.cache_nodes[0].address
      }
    ]
    
    secrets = [
      {
        name      = "DB_PASSWORD"
        valueFrom = "${aws_secretsmanager_secret.db_password.arn}:password::"
      },
      {
        name      = "REDIS_AUTH"
        valueFrom = "${aws_secretsmanager_secret.redis_auth.arn}:password::"
      }
    ]
    
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = { Name = "panini-api-task" }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/panini-api-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = { Name = "panini-ecs-logs" }
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "panini-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.https]

  tags = { Name = "panini-api-service" }
}

# Auto-scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  policy_name        = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

---

## 7. Storage (S3)

```hcl
# infrastructure/s3.tf

# Bucket para web app estática
resource "aws_s3_bucket" "web" {
  bucket = "panini-web-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = { Name = "panini-web-bucket" }
}

resource "aws_s3_bucket_versioning" "web" {
  bucket = aws_s3_bucket.web.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "web" {
  bucket = aws_s3_bucket.web.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bucket para fotos de usuarios
resource "aws_s3_bucket" "media" {
  bucket = "panini-media-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = { Name = "panini-media-bucket" }
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "delete-old-uploads"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

# Bucket para backups
resource "aws_s3_bucket" "backups" {
  bucket = "panini-backups-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = { Name = "panini-backups-bucket" }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# Outputs
output "s3_web_bucket" {
  value = aws_s3_bucket.web.id
}

output "s3_media_bucket" {
  value = aws_s3_bucket.media.id
}
```

---

## 8. Content Delivery Network (CloudFront)

```hcl
# infrastructure/cloudfront.tf

resource "aws_cloudfront_distribution" "web" {
  origin {
    domain_name = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id   = "S3Web"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.web.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Web"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  price_class = var.environment == "prod" ? "PriceClass_100" : "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = { Name = "panini-cdn" }
}

resource "aws_cloudfront_origin_access_identity" "web" {
  comment = "OAI for Panini web bucket"
}

# S3 bucket policy para CloudFront
resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "CloudFrontAccess"
      Effect = "Allow"
      Principal = {
        AWS = aws_cloudfront_origin_access_identity.web.iam_arn
      }
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.web.arn}/*"
    }]
  })
}

# Outputs
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.web.domain_name
}
```

---

## 9. Deployment Manual

### Primer Deploy

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-org/panini-infrastructure.git
cd panini-infrastructure

# 2. Inicializar Terraform
terraform init

# 3. Crear workspace para ambiente
terraform workspace new dev
terraform workspace select dev

# 4. Revisar plan
terraform plan -var-file="environments/dev.tfvars" -out=tfplan

# 5. Aplicar cambios
terraform apply tfplan

# 6. Guardar outputs
terraform output > outputs.json

# 7. Guardar state en S3 (opcional pero recomendado)
# Ver sección backup siguiente
```

### Backend State en S3 (Recomendado)

```hcl
# infrastructure/backend.tf

terraform {
  backend "s3" {
    bucket         = "panini-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}
```

---

## 10. Monitoreo con CloudWatch

```hcl
# infrastructure/monitoring.tf

# Alerta para CPU alto en ECS
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "panini-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when ECS CPU > 80%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }
}

# SNS Topic para alerts
resource "aws_sns_topic" "alerts" {
  name = "panini-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "panini-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average" }],
            ["AWS/ECS", "MemoryUtilization", { stat = "Average" }],
            ["AWS/RDS", "DatabaseConnections"],
            ["AWS/ElastiCache", "CacheHits"]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "System Metrics"
        }
      }
    ]
  })
}
```

---

## 11. Variables y Ambiente

```hcl
# infrastructure/variables.tf

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.small"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "ecs_task_cpu" {
  description = "ECS task CPU"
  type        = string
  default     = "256"
}

variable "ecs_task_memory" {
  description = "ECS task memory"
  type        = string
  default     = "512"
}

variable "ecs_desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 2
}

variable "api_domain" {
  description = "API domain"
  type        = string
}

variable "alert_email" {
  description = "Email for CloudWatch alerts"
  type        = string
}
```

```hcl
# environments/dev.tfvars

environment     = "dev"
aws_region      = "us-east-1"
db_username     = "admin"
api_domain      = "api-dev.panini-app.com"
alert_email     = "dev@panini-app.com"
ecs_desired_count = 1
```

---

## Próximos Pasos

1. Crear repositorio Git para infrastructure code
2. Proteger credenciales en AWS Secrets Manager
3. Configurar GitHub Actions para CI/CD
4. Crear backend API container
5. Deployar a staging
6. Testing completo
7. Promoción a production con aprobación manual
