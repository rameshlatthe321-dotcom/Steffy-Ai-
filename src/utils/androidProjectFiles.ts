export interface AndroidProjectFile {
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'properties';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'System permissions, Vosk microphone service, TTS queries, MainActivity, and SteffyAccessibilityService',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.steffyassistant">

    <!-- Telephony & Messaging Permissions -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- Offline Speech Recognition (Vosk) & Audio Recording -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />

    <!-- Query Declaration for TextToSpeech Engine (Android 11+) -->
    <queries>
        <intent>
            <action android:name="android.speech.tts.engine.INTENT_ACTION_TTS_SERVICE" />
        </intent>
    </queries>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Steffy Assistant"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SteffyAssistant">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Accessibility Service for Gesture & UI Screen Automation -->
        <service
            android:name=".SteffyAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>
    </application>
</manifest>`
  },
  {
    name: 'VoskSpeechService.kt',
    path: 'app/src/main/java/com/example/steffyassistant/VoskSpeechService.kt',
    language: 'kotlin',
    description: 'Offline speech recognition engine using Vosk ASR acoustic model and streaming audio',
    content: `package com.example.steffyassistant

import android.content.Context
import android.util.Log
import org.json.JSONObject
import org.vosk.Model
import org.vosk.Recognizer
import org.vosk.android.RecognitionListener
import org.vosk.android.SpeechService
import org.vosk.android.StorageService
import java.io.IOException

class VoskSpeechService(
    private val context: Context,
    private val onResultCallback: (String) -> Unit,
    private val onPartialCallback: (String) -> Unit,
    private val onErrorCallback: (Exception) -> Unit
) : RecognitionListener {

    companion object {
        private const val TAG = "VoskSpeechService"
        private const val MODEL_ASSET = "model-en-us" // Unpacked from assets/model-en-us
    }

    private var model: Model? = null
    private var speechService: SpeechService? = null
    var isModelReady: Boolean = false
        private set
    var isListening: Boolean = false
        private set

    /**
     * Unpacks small Vosk English acoustic model from assets and loads it into memory offline
     */
    fun initModel(onReady: () -> Unit) {
        StorageService.unpack(context, MODEL_ASSET, "model",
            { unpackedModel: Model ->
                model = unpackedModel
                isModelReady = true
                Log.d(TAG, "Vosk offline acoustic model initialized successfully")
                onReady()
            },
            { exception: IOException ->
                Log.e(TAG, "Failed to unpack Vosk model: \${exception.message}")
                onErrorCallback(exception)
            }
        )
    }

    /**
     * Starts listening to audio stream from microphone at 16kHz sample rate
     */
    fun startListening() {
        val currentModel = model ?: run {
            Log.w(TAG, "Cannot start listening: Vosk model is not ready")
            return
        }

        if (speechService != null) {
            speechService?.stop()
            speechService = null
        }

        try {
            // Configure recognizer with 16000 Hz sample rate
            val rec = Recognizer(currentModel, 16000.0f)
            speechService = SpeechService(rec, 16000.0f)
            speechService?.startListening(this)
            isListening = true
            Log.d(TAG, "Vosk offline speech recognition started")
        } catch (e: IOException) {
            onErrorCallback(e)
        }
    }

    /**
     * Stops listening to microphone
     */
    fun stopListening() {
        speechService?.stop()
        speechService = null
        isListening = false
        Log.d(TAG, "Vosk offline speech recognition stopped")
    }

    // Vosk RecognitionListener callbacks:

    override fun onPartialResult(hypothesis: String?) {
        if (hypothesis.isNullOrEmpty()) return
        try {
            val json = JSONObject(hypothesis)
            val partial = json.optString("partial", "").trim()
            if (partial.isNotEmpty()) {
                onPartialCallback(partial)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error parsing partial Vosk result: \${e.message}")
        }
    }

    override fun onResult(hypothesis: String?) {
        if (hypothesis.isNullOrEmpty()) return
        try {
            val json = JSONObject(hypothesis)
            val text = json.optString("text", "").trim()
            if (text.isNotEmpty()) {
                Log.d(TAG, "Vosk Final Transcribed Result: $text")
                onResultCallback(text)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing Vosk result: \${e.message}")
        }
    }

    override fun onFinalResult(hypothesis: String?) {
        onResult(hypothesis)
        isListening = false
    }

    override fun onError(exception: Exception?) {
        exception?.let { onErrorCallback(it) }
        isListening = false
    }

    override fun onTimeout() {
        isListening = false
    }

    fun destroy() {
        stopListening()
        model = null
        isModelReady = false
    }
}`
  },
  {
    name: 'accessibility_service_config.xml',
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    language: 'xml',
    description: 'Enables window inspection and programmatic gesture dispatch',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackSpoken"
    android:accessibilityFlags="flagDefault|flagReportViewIds"
    android:canPerformGestures="true"
    android:canRetrieveWindowContent="true"
    android:notificationTimeout="100" />`
  },
  {
    name: 'TaskExecutionManager.kt',
    path: 'app/src/main/java/com/example/steffyassistant/TaskExecutionManager.kt',
    language: 'kotlin',
    description: 'System actions: phone calls, SMS messaging, app launching, and SAF file picker',
    content: `package com.example.steffyassistant

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.telephony.SmsManager
import android.widget.Toast

class TaskExecutionManager(private val context: Context) {

    // 1. Place a direct Phone Call
    fun makeCall(phoneNumber: String) {
        try {
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:$phoneNumber")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: SecurityException) {
            Toast.makeText(context, "Call permission not granted: \${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Error placing call: \${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    // 2. Send SMS Message locally via SmsManager
    fun sendSms(phoneNumber: String, message: String) {
        try {
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                context.getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            Toast.makeText(context, "SMS sent to $phoneNumber", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Failed to send SMS: \${e.localizedMessage}", Toast.LENGTH_LONG).show()
        }
    }

    // 3. Launch external Application by Package Name
    fun launchApp(packageName: String): Boolean {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        return if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            true
        } else {
            Toast.makeText(context, "App package $packageName not found", Toast.LENGTH_SHORT).show()
            false
        }
    }

    // 4. File Management via Storage Access Framework (SAF)
    fun openFilePicker(activity: Activity) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*" // Opens all local document types
        }
        activity.startActivityForResult(intent, 2001)
    }
}`
  },
  {
    name: 'SteffyAccessibilityService.kt',
    path: 'app/src/main/java/com/example/steffyassistant/SteffyAccessibilityService.kt',
    language: 'kotlin',
    description: 'Accessibility Service for on-screen node inspection, clicking by text, and gesture execution',
    content: `package com.example.steffyassistant

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class SteffyAccessibilityService : AccessibilityService() {

    companion object {
        var instance: SteffyAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Receives OS accessibility events
    }

    override fun onInterrupt() {
        instance = null
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    // Click a UI node by matching on-screen text
    fun clickNodeByText(targetText: String): Boolean {
        val rootNode: AccessibilityNodeInfo = rootInActiveWindow ?: return false
        val matchingNodes = rootNode.findAccessibilityNodeInfosByText(targetText)
        
        for (node in matchingNodes) {
            if (node.isClickable) {
                val success = node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                node.recycle()
                return success
            }
            // Check parent if node itself isn't directly marked clickable
            var parent = node.parent
            while (parent != null) {
                if (parent.isClickable) {
                    val success = parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    parent.recycle()
                    return success
                }
                parent = parent.parent
            }
        }
        return false
    }

    // Perform programmatic swipe gesture across screen coordinates
    fun performSwipe(startX: Float, startY: Float, endX: Float, endY: Float, durationMs: Long = 300L) {
        val swipePath = Path().apply {
            moveTo(startX, startY)
            lineTo(endX, endY)
        }
        val stroke = GestureDescription.StrokeDescription(swipePath, 0, durationMs)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        dispatchGesture(gesture, null, null)
    }
}`
  },
  {
    name: 'IntentRouter.kt',
    path: 'app/src/main/java/com/example/steffyassistant/IntentRouter.kt',
    language: 'kotlin',
    description: 'Local offline natural language parsing and intent dispatching from Vosk transcripts',
    content: `package com.example.steffyassistant

class IntentRouter(
    private val taskManager: TaskExecutionManager,
    private val getAccessibilityService: () -> SteffyAccessibilityService? = { SteffyAccessibilityService.instance }
) {

    fun processUserCommand(input: String): String {
        val command = input.lowercase().trim()

        return when {
            // Match Call Intents
            command.startsWith("call") || command.contains("make a call to") || command.startsWith("dial") -> {
                val number = command.replace(Regex("[^0-9+]"), "")
                if (number.isNotEmpty()) {
                    taskManager.makeCall(number)
                    "Calling $number now."
                } else "Please specify a phone number to call."
            }

            // Match Texting Intents
            command.startsWith("text") || command.startsWith("send sms") || command.startsWith("message") -> {
                val parts = command.split(" to ")
                if (parts.size > 1) {
                    val targetAndMsg = parts[1].split(" saying ")
                    val number = targetAndMsg[0].replace(Regex("[^0-9+]"), "")
                    val msg = if (targetAndMsg.size > 1) targetAndMsg[1] else "Hello from Steffy"
                    if (number.isNotEmpty()) {
                        taskManager.sendSms(number, msg)
                        "Sending SMS to $number: '$msg'."
                    } else "Please specify a recipient phone number."
                } else "Who should I text?"
            }

            // Match App Launching Intents
            command.contains("open youtube") -> {
                taskManager.launchApp("com.google.android.youtube")
                "Opening YouTube."
            }
            command.contains("open whatsapp") -> {
                taskManager.launchApp("com.whatsapp")
                "Opening WhatsApp."
            }
            command.contains("open camera") -> {
                taskManager.launchApp("com.android.camera")
                "Opening Camera."
            }
            command.contains("open settings") -> {
                taskManager.launchApp("com.android.settings")
                "Opening Settings."
            }

            // Match Accessibility Automation Commands
            command.startsWith("click ") || command.startsWith("tap ") -> {
                val service = getAccessibilityService()
                if (service == null) {
                    "Steffy Accessibility Service is not enabled. Please enable it in Settings."
                } else {
                    val target = command.replace(Regex("^(click|tap)\\s+"), "").replace("\"", "")
                    val clicked = service.clickNodeByText(target)
                    if (clicked) "Clicked '$target' successfully." else "Could not find clickable element with text '$target'."
                }
            }

            command.contains("swipe up") -> {
                val service = getAccessibilityService()
                service?.performSwipe(500f, 1500f, 500f, 500f)
                "Performed swipe up."
            }
            command.contains("swipe down") -> {
                val service = getAccessibilityService()
                service?.performSwipe(500f, 500f, 500f, 1500f)
                "Performed swipe down."
            }

            else -> "Vosk transcribed: '$input'. Processed locally by Steffy."
        }
    }
}`
  },
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/example/steffyassistant/MainActivity.kt',
    language: 'kotlin',
    description: 'Jetpack Compose UI, Vosk Offline Speech Recognition loop, and TextToSpeech engine',
    content: `package com.example.steffyassistant

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    private lateinit var tts: TextToSpeech
    private lateinit var taskManager: TaskExecutionManager
    private lateinit var intentRouter: IntentRouter
    private lateinit var voskSpeechService: VoskSpeechService

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions.entries.all { it.value }
        if (granted) {
            initVoskOfflineAsr()
        } else {
            Toast.makeText(this, "Permissions required for Vosk mic & calls", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Core System Services
        tts = TextToSpeech(this, this)
        taskManager = TaskExecutionManager(this)
        intentRouter = IntentRouter(taskManager)

        // Set up Vosk Speech Service for Offline ASR
        voskSpeechService = VoskSpeechService(
            context = this,
            onResultCallback = { transcribedText ->
                runOnUiThread {
                    val response = intentRouter.processUserCommand(transcribedText)
                    speak(response)
                }
            },
            onPartialCallback = { partial ->
                // Update live recognition UI with partial tokens
            },
            onErrorCallback = { error ->
                runOnUiThread {
                    Toast.makeText(this, "Vosk ASR Error: \${error.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        )

        requestRequiredPermissions()

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SteffyUI(
                        voskService = voskSpeechService,
                        onCommandSubmitted = { command ->
                            val response = intentRouter.processUserCommand(command)
                            speak(response)
                            response
                        },
                        onSafRequested = {
                            taskManager.openFilePicker(this)
                        }
                    )
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CALL_PHONE,
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_CONTACTS,
            Manifest.permission.RECORD_AUDIO
        )
        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) {
            initVoskOfflineAsr()
        } else {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }

    private fun initVoskOfflineAsr() {
        voskSpeechService.initModel {
            runOnUiThread {
                Toast.makeText(this, "Vosk Offline Speech Model Loaded", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.US
        }
    }

    private fun speak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "STEFFY_UTTERANCE")
    }

    override fun onDestroy() {
        tts.stop()
        tts.shutdown()
        voskSpeechService.destroy()
        super.onDestroy()
    }
}

@Composable
fun SteffyUI(
    voskService: VoskSpeechService,
    onCommandSubmitted: (String) -> String,
    onSafRequested: () -> Unit = {}
) {
    var inputText by remember { mutableStateOf("") }
    var isListening by remember { mutableStateOf(false) }
    var assistantResponse by remember { mutableStateOf("Hello! I am Steffy, powered by offline Vosk speech recognition. Speak or type your request.") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Steffy Offline Assistant",
                style = MaterialTheme.typography.titleLarge
            )
            AssistChip(
                onClick = onSafRequested,
                label = { Text("Open Files (SAF)") }
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Conversational Output Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = assistantResponse,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Input Bar with Vosk Mic Toggle
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                label = { Text("Ask Steffy...") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))

            // Vosk Mic Button
            IconButton(
                onClick = {
                    if (isListening) {
                        voskService.stopListening()
                        isListening = false
                    } else {
                        voskService.startListening()
                        isListening = true
                    }
                },
                modifier = Modifier
                    .size(52.dp)
                    .background(
                        if (isListening) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.secondary,
                        shape = RoundedCornerShape(12.dp)
                    )
            ) {
                Icon(
                    imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Vosk Offline Mic",
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Send Button
            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        assistantResponse = onCommandSubmitted(inputText)
                        inputText = ""
                    }
                },
                modifier = Modifier
                    .size(52.dp)
                    .background(MaterialTheme.colorScheme.primary, shape = RoundedCornerShape(12.dp))
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = Color.White
                )
            }
        }
    }
}`
  },
  {
    name: 'build.gradle.kts (app)',
    path: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'App-level Gradle configuration with Vosk Android ASR and Jetpack Compose dependencies',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.steffyassistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.steffyassistant"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose BOM
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")

    // Vosk Offline Speech Recognition Library
    implementation("com.alphacephei:vosk-android:0.3.47")
    implementation("net.java.dev.jna:jna:5.13.0@aar")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}`
  },
  {
    name: 'build.gradle.kts (project)',
    path: 'build.gradle.kts',
    language: 'groovy',
    description: 'Project-level root Gradle build script',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
  },
  {
    name: 'settings.gradle.kts',
    path: 'settings.gradle.kts',
    language: 'groovy',
    description: 'Gradle repository configuration and project modules',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Vosk speech recognition repository
        maven { url = java.net.URI("https://alphacephei.com/maven/") }
    }
}

rootProject.name = "SteffyAssistant"
include(":app")`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Step-by-step instructions for compiling Steffy with Vosk offline ASR in Android Studio',
    content: `# Steffy Assistant - Offline Android Voice & Screen Automation Assistant

Steffy is an offline Android assistant built with:
- **Vosk Offline Speech Recognition**: 100% offline acoustic speech-to-text with zero internet connectivity.
- **Jetpack Compose UI**: Modern declarative Material 3 interface.
- **Offline Intent Router**: Instant rule & regex classification without cloud APIs.
- **Accessibility Services**: UI screen automation, clicking by text label, and gesture dispatching.
- **Storage Access Framework (SAF)**: Local documents and media management.

## Vosk Offline Model Setup
1. Download the lightweight English model \`vosk-model-small-en-us-0.15.zip\` (~40 MB) from https://alphacephei.com/vosk/models.
2. Extract the contents into \`app/src/main/assets/model-en-us/\`.
3. When the app launches, \`VoskSpeechService\` unpacks the model into device storage and streams microphone audio offline.

## How to Build in Android Studio
1. Open Android Studio and select the project directory.
2. Wait for Gradle sync to complete.
3. Connect your Android device via USB with USB debugging enabled.
4. Click **Run 'app'** (Shift + F10).
5. Grant Microphone and Phone permissions, then enable Steffy in **Settings > Accessibility**.
`
  }
];
