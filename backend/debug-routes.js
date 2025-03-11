const fs = require('fs');
const path = require('path');

// Read the courseRoutes.js file
const routesPath = path.join(__dirname, 'routes', 'courseRoutes.js');
const routesContent = fs.readFileSync(routesPath, 'utf8');

// Split by lines and log line 29 and surrounding lines
const lines = routesContent.split('\n');
console.log('Line 27:', lines[26]);
console.log('Line 28:', lines[27]);
console.log('Line 29:', lines[28]);
console.log('Line 30:', lines[29]);
console.log('Line 31:', lines[30]);

// Check if all controller functions are defined
const controllerPath = path.join(__dirname, 'controllers', 'courseController.js');
const controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Extract all exported functions from the controller
const exportedFunctions = [];
const exportRegex = /exports\.(\w+)\s*=/g;
let match;
while ((match = exportRegex.exec(controllerContent)) !== null) {
  exportedFunctions.push(match[1]);
}

console.log('Exported functions:', exportedFunctions);

// Extract all route handlers from the routes file
const routeHandlers = [];
const routeRegex = /router\.(get|post|put|delete)\([^,]+,\s*([^,\)]+)/g;
while ((match = routeRegex.exec(routesContent)) !== null) {
  routeHandlers.push(match[2].trim());
}

console.log('Route handlers:', routeHandlers);

// Find handlers that are used in routes but not exported from controller
const missingHandlers = routeHandlers.filter(handler => 
  !exportedFunctions.includes(handler) && 
  !handler.startsWith('protect') && 
  !handler.startsWith('authorize')
);

console.log('Missing handlers:', missingHandlers);