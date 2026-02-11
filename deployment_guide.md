# Android Deployment & Play Store Guide

This guide details the steps to publish your "The Universsaall University" app to the Google Play Store and how to manage future updates.

## 1. Prerequisites
- **Google Play Developer Account**: Required to publish apps.
    - **Cost**: $25 one-time fee.
    - **Link**: [Google Play Console](https://play.google.com/console/signup)

## 2. Generating a Signing Key (Keystore)
To publish, you must sign your app with a cryptographic key. **You must keep this file safe. If you lose it, you can never update your app again.**

### Command to Generate Key:
Run this in your terminal (inside `android/app` folder):
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```
- It will ask for a password. **Remember it.**
- It will ask for details (Name, Organization, etc.).
- It generates a file named `my-release-key.jks`.

## 3. Configuring the Release Build
We need to tell Gradle to use this key when building for release.

**Step A:** Move `my-release-key.jks` into the `android/app` folder.

**Step B:** (I can do this for you) Update `android/app/build.gradle`:
```groovy
android {
    signingConfigs {
        release {
            storeFile file("my-release-key.jks")
            storePassword "YOUR_PASSWORD"
            keyAlias "my-key-alias"
            keyPassword "YOUR_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 4. Building the Release Bundle (AAB)
The Play Store requires an **Android App Bundle (.aab)**, not an APK. An AAB allows Google to optimize the download size for each user's device.

**Command:**
```bash
cd android
./gradlew bundleRelease
```
**Output Location:**
`android/app/build/outputs/bundle/release/app-release.aab`

## 5. Uploading to Play Store
1.  **Create App**: Log in to Play Console > "Create App".
2.  **Store Listing**: Upload your App Icon (512x512), Feature Graphic (1024x500), Screenshots, Title, and Description.
3.  **Privacy Policy**: You must provide a link to your privacy policy (since you handle user data).
4.  **Release**: Go to **Production** > **Create new release**.
5.  **Upload**: Upload your `app-release.aab` file.
6.  **Review**: Submit for review. (First review takes 1-7 days).

---

## 6. How to Push Updates?

There are two ways to update your app:

### Method A: Standard Update (Recommended)
Use this when you change Native Code (Plugins, App Icon) or want a formal release.

1.  **Update Code**: Make your changes in the React project.
2.  **Sync**: Run `npx cap sync`.
3.  **Increment Version**:
    - Open `android/app/build.gradle`.
    - Increase `versionCode` by 1 (e.g., `1` -> `2`).
    - Change `versionName` (e.g., `"1.0"` -> `"1.1"`).
4.  **Build**: Run `./gradlew bundleRelease`.
5.  **Upload**: Create a new release in Play Console and upload the new `.aab`.

### Method B: Live Updates (Optional / Advanced)
Use this for quick bug fixes (JS/CSS only) without waiting for Play Store review.
- **Tools**: [Capgo](https://capgo.app/) or [Ionic Appflow](https://ionic.io/appflow).
- **How it works**: The app checks a server for new web assets (HTML/JS) on launch and downloads them instantly.
- **Note**: This requires extra setup and paid services usually.

## Summary Checklist
- [ ] Create Google Play Account.
- [ ] Generate Keystore.
- [ ] Configure `build.gradle` for signing.
- [ ] Build `app-release.aab`.
- [ ] Upload to Console.
