const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'DirectPrint Service',
  description: 'Direct Print Server for automatic printer management',
  script: path.join(__dirname, '..', '..', '..', 'src', 'index.js')
});

// Listen for the "uninstall" event
svc.on('uninstall', function(){
  console.log('✅ Direct Print Service uninstalled successfully!');
  console.log('🛑 Service removed from Windows startup');
  console.log('🔧 Service configuration cleaned up');
  process.exit(0);
});

svc.on('stop', function(){
  console.log('🛑 Direct Print Service stopped');
  console.log('🗑️  Uninstalling service...');
  svc.uninstall();
});

svc.on('error', function(err){
  console.error('❌ Uninstall error:', err);
  console.log('💡 Try running as Administrator if permission denied');
  process.exit(1);
});

console.log('🗑️  Uninstalling Direct Print Windows Service...');
console.log('⚙️  Checking service status...');

// Check if service exists and uninstall
try {
  if (svc.exists) {
    console.log('📍 Service found - stopping and uninstalling...');
    svc.stop();
  } else {
    console.log('⚠️  Service not found - attempting cleanup anyway...');
    svc.uninstall();
  }
} catch (error) {
  console.error('❌ Failed to uninstall service:', error.message);
  console.log('💡 Try running as Administrator');
  process.exit(1);
}