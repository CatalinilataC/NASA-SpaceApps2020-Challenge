import React from 'react';
import './App.css';
import HeatmapCanvas from './HeatmapCanvas';
import ImgUploaderer from './ImgUploaderer';
import logo from './sad_earth.png'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <br/>
      <ImgUploaderer/>
      </header>
    </div>
  );
}

export default App;
