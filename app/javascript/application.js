// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './components/HelloWorld';
import BuildingList from './components/BuildingList';

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('react-root');
  if (node) {
    // ReactDOM.render(<HelloWorld />, node);
    ReactDOM.render(<BuildingList />, node);
  }
});
