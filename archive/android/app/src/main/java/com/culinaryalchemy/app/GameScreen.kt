package com.culinaryalchemy.app

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun GameScreen(engine: GameEngine) {
    var refreshKey by remember { mutableIntStateOf(0) }
    fun refresh() {
        refreshKey += 1
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "Culinary Alchemy",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
        )

        Row(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            CabinetPanel(
                engine = engine,
                refreshKey = refreshKey,
                onItemAdded = { refresh() }
            )

            CounterPanel(
                engine = engine,
                modifier = Modifier.weight(1f),
                refreshKey = refreshKey,
                onChanged = { refresh() }
            )
        }

        ToolBar(
            engine = engine,
            refreshKey = refreshKey,
            onToolSelected = {
                engine.activeTool = it
                refresh()
            }
        )
    }
}

@Composable
private fun CabinetPanel(
    engine: GameEngine,
    refreshKey: Int,
    onItemAdded: () -> Unit
) {
    @Suppress("UNUSED_VARIABLE")
    val bump = refreshKey

    Column(
        modifier = Modifier
            .width(200.dp)
            .fillMaxHeight()
            .background(Color(0xFFF2EBDD))
            .padding(12.dp)
    ) {
        Text("Cabinet", fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            engine.cabinetItems.forEach { id ->
                OutlinedButton(
                    onClick = {
                        engine.addToCounter(id)
                        onItemAdded()
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(engine.label(id))
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CounterPanel(
    engine: GameEngine,
    modifier: Modifier = Modifier,
    refreshKey: Int,
    onChanged: () -> Unit
) {
    @Suppress("UNUSED_VARIABLE")
    val bump = refreshKey

    Column(
        modifier = modifier
            .fillMaxHeight()
            .padding(12.dp)
    ) {
        Text("Counter", fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                engine.counter.forEachIndexed { index, id ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = if (engine.selectedCounterIndex == index) {
                                Color(0x33C45C26)
                            } else {
                                Color(0x1A000000)
                            },
                            shape = MaterialTheme.shapes.medium
                        ) {
                            OutlinedButton(
                                onClick = {
                                    engine.selectCounter(index)
                                    onChanged()
                                },
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = Color.Transparent
                                )
                            ) {
                                Text(engine.label(id))
                            }
                        }
                        OutlinedButton(onClick = {
                            engine.removeFromCounter(index)
                            onChanged()
                        }) {
                            Text("×")
                        }
                    }
                }
            }
        }

        engine.selectedCounterIndex?.let { index ->
            if (index in engine.counter.indices) {
                Button(
                    onClick = {
                        engine.applyTool(index)
                        onChanged()
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Apply ${engine.activeTool} to ${engine.label(engine.counter[index])}")
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = engine.message,
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF6B5E4F)
        )
    }
}

@Composable
private fun ToolBar(
    engine: GameEngine,
    refreshKey: Int,
    onToolSelected: (String) -> Unit
) {
    @Suppress("UNUSED_VARIABLE")
    val bump = refreshKey

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFEFE4D0))
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        engine.unlockedTools.forEach { (id, label) ->
            val selected = engine.activeTool == id
            Button(
                onClick = { onToolSelected(id) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selected) Color(0x66C45C26) else Color(0x33FFFFFF)
                )
            ) {
                Text(label)
            }
        }
    }
}
