const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'DirectPrint Service',
  description: 'Direct Print Server for automatic printer management',
  script: path.join(__dirname, '..', '..', '..', 'src', 'index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function(){
  console.log('✅ Direct Print Service installed successfully!');
  console.log('🚀 Starting service...');
  svc.start();
});

svc.on('start', function(){
  console.log('🎯 Direct Print Service started!');
  console.log('🌐 Server available at: http://localhost:4000');
  console.log('✨ Service will automatically start on Windows boot');
});

svc.on('error', function(err){
  console.error('❌ Service error:', err);
});

console.log('📦 Installing Direct Print as Windows Service...');
console.log('⚙️  This may take a moment...');

// Install the service
svc.install();