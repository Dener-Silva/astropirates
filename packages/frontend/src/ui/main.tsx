import React from 'react'
import ReactDOM from 'react-dom/client'
import { ScoreDisplay } from './ScoreDisplay.tsx'
import { StartScreen } from './start_screen/StartScreen.tsx'
import './main.css'
import { GameStateProvider } from './GameStateContext.tsx'
import { DeathScreen } from './DeathScreen.tsx'
import { Joystick } from './touch_controls/Joystick.tsx'
import { ShootButton } from './touch_controls/ShootButton.tsx'
import { isMultiTouch } from '../isMultiTouch.tsx'
import { FullscreenButton } from './touch_controls/FullscreenButton.tsx'
import { ConnectionLostWarning } from './ConnectionLostWarning.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ScoreDisplay></ScoreDisplay>
        <GameStateProvider>
            <StartScreen></StartScreen>
            <DeathScreen></DeathScreen>
            {isMultiTouch() && (<>
                <Joystick />
                <ShootButton />
                <FullscreenButton />
            </>)
            }
        </GameStateProvider>
        <ConnectionLostWarning />
    </React.StrictMode>,
)
