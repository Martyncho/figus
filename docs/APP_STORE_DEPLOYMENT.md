# Guía Completa: Deployment en App Stores

## 1. Google Play Store (Android)

### 1.1 Requisitos Previos

#### Cuenta Developer Google Play
- Costo: $25 USD (único, de por vida)
- Pasos:
  1. Ir a [Google Play Console](https://play.google.com/console)
  2. Crear cuenta Google si no tienes
  3. Aceptar términos del desarrollador
  4. Completar perfil de desarrollador
  5. Pagar $25

#### Configuración
- Email verificado
- Método de pago válido (tarjeta de crédito)
- Teléfono verificado (recomendado)

### 1.2 Preparación del APK/AAB

#### Build Signed Release
```bash
# En la carpeta mobile-app/android

# Generar keystore (SOLO UNA VEZ)
keytool -genkey -v -keystore panini-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias panini-key

# Parámetros a ingresar:
# First and last name: Tu nombre
# Organizational unit: Dev
# Organization: Tu empresa
# City/locality: Tu ciudad
# State/province: Tu estado
# Country code: AR (2 letras)
# Password: [Guardar en lugar seguro - AWS Secrets Manager]

# Configurar en android/app/build.gradle
signingConfigs {
    release {
        storeFile file('panini-release-key.jks')
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}

# Buildear
./gradlew bundleRelease
# Genera: android/app/build/outputs/bundle/release/app-release.aab

# O generar APK (alternativa)
./gradlew assembleRelease
# Genera: android/app/build/outputs/apk/release/app-release.apk
```

#### Versioning
```
Actualizar en android/app/build.gradle:
- versionCode: Incremental (1, 2, 3, ...)
- versionName: Semántico (1.0.0, 1.0.1, 1.1.0, ...)

Format: MAJOR.MINOR.PATCH

1.0.0 = Initial release
1.0.1 = Bugfix
1.1.0 = Feature
2.0.0 = Major version
```

### 1.3 App Store Listing

#### Información Requerida

**Título**
```
Panini Figuritas - Colecciona el Álbum
Límite: 50 caracteres
```

**Descripción Corta**
```
Colecciona figuritas del álbum de Panini del Mundial de Fútbol
Límite: 80 caracteres
```

**Descripción Completa**
```
Panini Figuritas es la app oficial para coleccionar tu álbum de figuritas de Panini.

📱 Características:
• Escanea o ingresa manualmente tus figuritas
• Visualiza tu colección completa
• Ve qué figuritas te faltan
• Tracking de duplicados
• Sincronización en la nube

🚀 Cómo usar:
1. Descarga la app
2. Inicia sesión con Facebook, Instagram o TikTok
3. Captura la foto del número o ingresa manualmente
4. ¡Listo! Tu colección se sincroniza automáticamente

🎁 Características Premium:
• Ver qué amigos tienen tus faltantes
• Sistema de intercambios
• Filtros avanzados

[200-4000 caracteres permitidos]
```

**Categoría**
- Entretenimiento o Estilo de vida

**Clasificación de Contenidos**
- Edad: 3+ (sin contenido ofensivo)

**URL de Privacidad**
```
https://panini-app.com/privacy-policy
```

**URL de Términos de Servicio**
```
https://panini-app.com/terms-of-service
```

**Email de Soporte**
```
support@panini-app.com
```

### 1.4 Screenshots y Gráficos

#### Requisitos
- Mínimo: 2 screenshots
- Máximo: 8 screenshots
- Formato: PNG o JPEG
- Resolución: 1080x1920 (9:16 aspect ratio)
- Tamaño: < 8 MB cada uno

#### Contenido Recomendado
1. Pantalla de login
2. Dashboard con estadísticas
3. Captura de foto
4. Tablero de figuritas
5. Vista de faltantes
6. Perfil usuario

#### Icon
- 512x512 píxeles
- PNG
- Sin esquinas redondeadas (Play Store las agrega)

#### Feature Graphic (Banner)
- 1024x500 píxeles
- PNG o JPEG

### 1.5 Procedimiento de Upload

#### En Google Play Console

1. **Crear App Nuevo**
   - Click "Crear aplicación"
   - Nombre: "Panini Figuritas"
   - Categoría: Entretenimiento
   - Seleccionar país principal

2. **Completar Información**
   - Store Listing → Completar todos los campos
   - Content Rating → Llenar cuestionario
   - Pricing & Distribution → Gratuita

3. **Upload del Build**
   - Testing → Internal Testing
     - Click "Create new release"
     - Upload APK/AAB
     - Versión: 1.0.0
     - Release notes: "Initial release"
   - Probar con tester accounts
   - Cuando esté listo: Promocionar a Alpha → Beta → Production

4. **Testeo Interno**
   ```
   - Agregar 5-10 testers internos
   - Esperar min 24 horas
   - Probar todas las features
   - Verificar performance
   ```

5. **Alpha Testing**
   ```
   - Agregar ~50 testers externos
   - URL de Play Store para instalar
   - Recopilar feedback
   - Esperar 1-2 semanas
   ```

6. **Beta Testing**
   ```
   - Expandir a más testers
   - Últimos ajustes
   - Final QA
   ```

7. **Production Release**
   ```
   - Review: 2-4 horas
   - Si es primera app: 24-48 horas
   - Publicación gradual (recomendado):
     - 10% usuarios (1 hora)
     - 50% usuarios (1 día)
     - 100% usuarios (1 día)
   - Monitorear crashes y reviews
   ```

### 1.6 Policy Compliance

#### Políticas Google Play
- No contener malware
- Aplicación funcional en mínimo 1 dispositivo
- Edad 3+
- Permisos justificados (Camera, Storage)
- Política de privacidad clara
- No monetización prohibida (no spam, no engaño)

---

## 2. Apple App Store (iOS)

### 2.1 Requisitos Previos

#### Cuenta Developer Apple
- Costo: $99 USD/año
- Requisitos:
  - Número DUNS
  - Información de organización/indiv.
  - Método de pago
  - Información bancaria

#### Pasos para Crear Cuenta
1. Ir a [Apple Developer Program](https://developer.apple.com/programs/)
2. Seleccionar "Enroll"
3. Sign in con Apple ID
4. Aceptar acuerdos
5. Completar formulario
6. Pagar $99
7. Esperar aprobación (1-2 días)

#### Configuración en Xcode
```
1. Xcode → Preferences → Accounts
2. Add Apple ID
3. Manage Certificates
4. Crear certificados:
   - iOS App Development
   - iOS App Distribution
```

### 2.2 Preparación del IPA

#### Bundle Identifier
```
Debe ser único en Apple
Formato: com.tu-empresa.panini
Ej: com.paniniargentina.figuritas

Configurar en Xcode:
- Target → General → Bundle Identifier
```

#### Versioning
```
Version: 1.0 (visible al usuario)
Build: 1 (interno)

Incrementar para cada release:
- v1.0 (build 1) → primera release
- v1.0.1 (build 2) → bugfix
- v1.1 (build 3) → feature
```

#### Certificados y Provisioning Profiles
```
Necesarios:
1. Apple Development Certificate (para testing)
2. Apple Distribution Certificate (para App Store)
3. App Store Provisioning Profile

En Xcode:
- Target → Signing & Capabilities
- Select Team
- Xcode auto-manages certificates (recomendado)
```

#### Build para App Store
```bash
cd mobile-app/ios

# Crear archive
xcodebuild -workspace PaniApp.xcworkspace \
  -scheme PaniApp \
  -configuration Release \
  -archivePath ./PaniApp.xcarchive \
  archive

# Generar IPA
xcodebuild -exportArchive \
  -archivePath ./PaniApp.xcarchive \
  -exportOptionsPlist ./ExportOptions.plist \
  -exportPath ./
```

#### ExportOptions.plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
<plist version="1.0">
<dict>
    <key>destination</key>
    <string>generic/platform=iOS</string>
    <key>method</key>
    <string>app-store</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

### 2.3 App Store Connect Listing

#### Información Requerida

**Nombre de App**
```
Panini Figuritas
Límite: 30 caracteres
```

**Descripción**
```
Panini Figuritas es la app oficial para coleccionar tu álbum.

Características:
- Escanea figuritas con la cámara
- Ingresa números manualmente
- Ve tu colección completa
- Descubre qué te falta
- Sincronización automática en la nube

Inicia sesión con Facebook, Instagram o TikTok y comienza a coleccionar.
```

**Palabras Clave** (máximo 30 caracteres)
```
figuritas, panini, album, mundial, colecciones
```

**Categoría Primaria**
```
Entertainment
```

**Categoría Secundaria** (opcional)
```
Lifestyle
```

**URL de Privacidad**
```
https://panini-app.com/privacy-policy
```

**URL de Terms & Conditions** (opcional)
```
https://panini-app.com/terms-of-service
```

**Información de Contacto**
```
support@panini-app.com
```

**Age Rating Questionnaire**
- Seleccionar "4+" (sin contenido problemático)

### 2.4 Screenshots y Gráficos

#### Requisitos
- Múltiples tamaños de pantalla:
  - iPhone 6.7" (1284x2778)
  - iPhone 6.1" (1170x2532)
  - iPhone 5.5" (1242x2208)
- Mínimo: 2 screenshots
- Máximo: 10 screenshots
- PNG o JPEG

#### Preview Video (opcional)
- MP4 format
- 500MB máximo
- Resolución: 1920x1080
- 15-30 segundos

#### App Icon
- 1024x1024 píxeles
- PNG
- Sin transparencia
- Sin bordes redondeados
- RGB (no CMYK)

### 2.5 Procedimiento de Upload

#### Usando Xcode
```
1. Xcode → Product → Archive
2. Distributing App
3. App Store Connect
4. Upload
5. Seleccionar Team
6. Automáticamente sube a App Store Connect
```

#### O Usando Transporter
```bash
# Descargar IPA primero
# Luego:
xcrun altool --upload-app -f app.ipa \
  -t ios -u "apple-id@example.com" \
  -p "app-specific-password"
```

### 2.6 App Store Review

#### Processo
1. **Submit for Review**
   - En App Store Connect → Submit for Review
   - Llenar questionnaire
   - Seleccionar release date

2. **Review Timeline**
   - Standard: 24-48 horas
   - Primera vez: hasta 5 días
   - Monitorear status en App Store Connect

3. **Common Rejection Reasons**
   - Privacy policy missing/incompleta
   - Crashes en testing
   - OAuth configuration incompleta
   - Permissions no justificadas
   - Inconsistencies en screenshots
   - Broken links

4. **En caso de Rechazo**
   - Leer feedback detallado
   - Hacer correcciones
   - Submit nueva versión
   - Típicamente 2-3 rondas

#### Privacy & Security Checks
- Apple verifica:
  - Política de privacidad accesible
  - OAuth implementado correctamente
  - Permisos justificados (camera, storage)
  - Encriptación de datos sensibles
  - Compliance con COPPA/GDPR

### 2.7 Release Strategy

#### Phased Release
```
Apple App Store permite:
- Immediate Release (100% instantáneo)
- Phased Release (automático, 7 días)
  - Día 1: 1% usuarios
  - Día 2: 5% usuarios
  - Día 3: 10% usuarios
  - Días 4-7: 100% usuarios

Ventajas:
- Detectar bugs antes de llegar a todos
- Monitorear crash rates
- Revertir si es necesario

Recomendado: Usar Phased Release
```

#### TestFlight
```
Antes de submit a review, usar TestFlight:

1. Build & Archive
2. Upload a App Store Connect
3. Ir a TestFlight
4. Agregar testers internos (team)
5. Agregar testers externos (hasta 10,000)
6. Esperar aprobación (1-2 días)
7. Testers descargan desde TestFlight app
8. Recopilar crash logs y feedback
9. Hacer fixes si es necesario
10. Submit to App Store
```

---

## 3. Automatización de Deployment (CI/CD)

### 3.1 GitHub Actions Workflow

```yaml
name: Deploy to App Stores

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: '11'
      
      - name: Build Android App
        working-directory: mobile-app/android
        run: |
          ./gradlew bundleRelease
      
      - name: Upload to Google Play
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: 'com.paniniargentina.figuritas'
          releaseFiles: 'mobile-app/android/app/build/outputs/bundle/release/app-release.aab'
          track: 'internal'
          status: 'inProgress'

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Certificates
        run: |
          # Import certificates from secrets
          echo "${{ secrets.IOS_CERTIFICATE_P12 }}" | base64 -d > certificate.p12
          security import certificate.p12 -k ~/Library/Keychains/login.keychain-db -P "${{ secrets.IOS_CERTIFICATE_PASSWORD }}"
      
      - name: Build iOS App
        working-directory: mobile-app/ios
        run: |
          xcodebuild archive \
            -workspace PaniApp.xcworkspace \
            -scheme PaniApp \
            -configuration Release \
            -archivePath ./PaniApp.xcarchive
      
      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath ./PaniApp.xcarchive \
            -exportOptionsPlist ./ExportOptions.plist \
            -exportPath ./
      
      - name: Upload to App Store
        run: |
          xcrun altool --upload-app \
            -f PaniApp.ipa \
            -t ios \
            -u "${{ secrets.APPLE_ID }}" \
            -p "${{ secrets.APP_SPECIFIC_PASSWORD }}"
```

### 3.2 Secrets necesarios en GitHub

```
Configurar en: Settings → Secrets → Actions

Google Play:
- GOOGLE_PLAY_SERVICE_ACCOUNT: (JSON con credenciales)

Apple:
- APPLE_ID: (apple@example.com)
- APP_SPECIFIC_PASSWORD: (generated from Apple ID)
- IOS_CERTIFICATE_P12: (base64 encoded)
- IOS_CERTIFICATE_PASSWORD: (contraseña del certificado)
- IOS_PROVISIONING_PROFILE: (base64 encoded)
- IOS_TEAM_ID: (de Apple Developer)
```

---

## 4. Post-Launch Monitoring

### 4.1 Metrics a Monitorear

#### Google Play Console
- Downloads
- Uninstalls
- Crashes
- ANRs (Application Not Responding)
- User reviews & ratings
- Geographic data

#### App Store Connect
- Download reports
- Revenue
- Crash logs
- Performance
- User reviews

### 4.2 Versioning Updates

#### Bugfix Release (1.0.1)
```
- Tiempo: 1-2 días
- Teste en staging
- Fix críticos
- No nuevas features
```

#### Minor Release (1.1.0)
```
- Tiempo: 1-2 semanas
- Nuevas features pequeñas
- Improvements
- Testing completo
```

#### Major Release (2.0.0)
```
- Tiempo: 1-2 meses
- Redesign o cambios significativos
- New features
- Extenso testing y QA
```

#### Update Timeline
```
Google Play:
- Submit → Review (2-4 horas) → Live (~30 min)
- Total: 3-5 horas

Apple App Store:
- Submit → Review (24-48 horas) → Phased release (7 días)
- Total: 8-10 días
```

---

## 5. Monetización Futura

### 5.1 App Store Payment Methods

#### In-App Purchases
```
Google Play & Apple App Store permiten:
- Premium subscriptions
- Coins/Credits
- Ad removal
- Early access a nuevas features

Porcentaje para desarrollador:
- Google Play: 70% (primeros 1M, luego 85%)
- Apple: 70% (primeros 1M, luego 85%)
```

#### Advertising
```
AdMob (Google):
- Banner ads
- Interstitial ads
- Rewarded ads

Facebook Audience Network:
- Alternativa a AdMob
```

#### Premium Tier
```
Posible modelo freemium:
- Gratis: Agregar/ver figuritas básico
- Premium: $4.99/mes - Features avanzadas
```

---

## 6. Checklist Final Before Launch

### 6.1 Backend/API
- [ ] Todos los endpoints testeados
- [ ] SSL/TLS configurado
- [ ] Rate limiting activado
- [ ] Logging centralizado
- [ ] Backups automáticos
- [ ] Monitoring en CloudWatch
- [ ] Alertas configuradas

### 6.2 Frontend
- [ ] Responsive en todos los tamaños
- [ ] Performance optimizado
- [ ] Offline mode funcional
- [ ] GDPR compliance
- [ ] Privacidad policy publicada

### 6.3 Mobile App
- [ ] Testeado en min. 3 dispositivos reales
- [ ] Cámara funcional
- [ ] OAuth flows funcionan
- [ ] No crashes
- [ ] Memory leaks verificados
- [ ] Battery drain aceptable

### 6.4 Store Listings
- [ ] Screenshots atractivos
- [ ] Descripciones precisas
- [ ] Íconos correctos
- [ ] Privacy policy accessible
- [ ] Soporte email configurado

### 6.5 Legal
- [ ] Privacy Policy (GDPR compliant)
- [ ] Terms of Service
- [ ] COPPA compliance (si aplica)
- [ ] Atribuciones correctas
- [ ] Marca Panini autorizada (importante!)

---

## 7. Troubleshooting Común

### Google Play
**Problema**: Build rejected por permissions
**Solución**: Justificar cada permission en targetSdkVersion y AndroidManifest.xml

**Problema**: App crashes en APK pero no en emulator
**Solución**: Usar versión release de app, test en múltiples dispositivos

### Apple App Store
**Problema**: "Invalid Provisioning Profile"
**Solución**: Regenerar en Apple Developer, descarguar en Xcode

**Problema**: "Missing Privacy Policy"
**Solución**: Agregar URL en App Store Connect, asegurar que sea accesible HTTPS

**Problema**: Review rejected por "Non-functional features"
**Solución**: Asegurar OAuth flow completo, camera accesible, API respondiendo
