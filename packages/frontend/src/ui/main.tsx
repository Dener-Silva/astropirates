import React from 'react'
import ReactDOM from 'react-dom/client'
import { ScoreDisplay } from './ScoreDisplay.tsx'
import { StartScreen } from './StartScreen.tsx'
import './main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ScoreDisplay></ScoreDisplay>
        <StartScreen></StartScreen>
    </React.StrictMode>,
)
