import React from 'react'
import ReactDOM from 'react-dom/client'
import { ScoreDisplay } from './ScoreDisplay.tsx'
import { StartScreen } from './start_screen/StartScreen.tsx'
import './main.css'
import { GameStateProvider } from './GameStateContext.tsx'
import { DeathScreen } from './DeathScreen.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ScoreDisplay></ScoreDisplay>
        <GameStateProvider>
            <StartScreen></StartScreen>
            <DeathScreen></DeathScreen>
        </GameStateProvider>
    </React.StrictMode>,
)
