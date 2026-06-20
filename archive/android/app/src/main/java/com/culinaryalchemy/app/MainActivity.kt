package com.culinaryalchemy.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val engine = GameEngine(applicationContext)

        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFFC45C26),
                    secondary = Color(0xFF8B3A1A),
                    background = Color(0xFFF8F1E4),
                    surface = Color(0xFFF8F1E4)
                )
            ) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    GameScreen(engine = engine)
                }
            }
        }
    }
}
