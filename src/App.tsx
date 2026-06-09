import React from 'react'
import KaraokePlayer from './KaraokePlayer'

const App = () => {
  return (
    <div>
      <h1 style={{textAlign:'center'}}>My AI Karaoke App</h1>
      <KaraokePlayer initialVideoId='tAEek8nO11c'/>
    </div>
  )
}

export default App