const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});
const escpos = require('escpos');

// Add CORS middleware for Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Add JSON parsing middleware
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize USB adapter with proper error handling for Windows
let USBAdapter = null;
let usbAvailable = false;

try {
  // Only try to load USB on non-Windows or when specifically requested
  if (os.platform() !== 'win32') {
    USBAdapter = require('escpos-usb');
    escpos.USB = USBAdapter;
    usbAvailable = true;
    console.log('USB printing enabled for', os.platform());
  } else {
    console.log('Windows detected - USB printing disabled, using system printers only');
    console.log('This avoids the "usb.on is not a function" error on Windows');
  }
} catch (error) {
  console.log('USB printing not available:', error.message);
  console.log('Using system printers only - this is normal on Windows');
}

// Function to detect available printers
function detectAvailablePrinters(callback) {
  if (os.platform() === 'win32') {
    // Windows: Try multiple methods for maximum compatibility
    console.log('Detecting Windows printers...');
    
    // Method 1: Simple PowerShell command
    const psCommand = 'powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"';
    
    exec(psCommand, (error, stdout, stderr) => {
      if (!error && stdout.trim()) {
        const printers = stdout.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (printers.length > 0) {
          console.log('PowerShell detected printers:', printers);
          return callback(printers);
        }
      }
      
      console.log('PowerShell method failed, trying wmic...');
      
      // Method 2: WMIC fallback
      const wmicCommand = 'wmic printer get name /format:list';
      exec(wmicCommand, (wmicError, wmicStdout) => {
        if (!wmicError && wmicStdout) {
          const printers = [];
          const lines = wmicStdout.split('\n');
          
          lines.forEach(line => {
            if (line.startsWith('Name=')) {
              const printerName = line.substring(5).trim();
              if (printerName && printerName.length > 0) {
                printers.push(printerName);
              }
            }
          });
          
          if (printers.length > 0) {
            console.log('WMIC detected printers:', printers);
            return callback(printers);
          }
        }
        
        console.log('All Windows printer detection methods failed');
        callback([]);
      });
    });
    
  } else {
    // Unix-like systems (macOS, Linux)
    const command = os.platform() === 'darwin' ? 'lpstat -p' : 'lpstat -p';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('Could not detect system printers:', error.message);
        return callback([]);
      }
      
      const printers = [];
      const lines = stdout.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const match = line.match(/printer\s+(.+?)\s+/);
        if (match) printers.push(match[1]);
      });
      
      console.log('Unix detected printers:', printers);
      callback(printers);
    });
  }
}

// Function to get default printer
function getDefaultPrinter(callback) {
  if (os.platform() === 'win32') {
    console.log('Getting Windows default printer...');
    
    // Method 1: Simple PowerShell command
    const psCommand = 'powershell -Command "Get-WmiObject -Class Win32_Printer | Where-Object {$_.Default} | Select-Object -ExpandProperty Name"';
    
    exec(psCommand, (error, stdout) => {
      if (!error && stdout.trim()) {
        const defaultPrinter = stdout.trim();
        console.log('PowerShell found default printer:', defaultPrinter);
        return callback(defaultPrinter);
      }
      
      console.log('PowerShell method failed, trying wmic...');
      
      // Method 2: WMIC fallback
      const wmicCommand = 'wmic printer where "Default=TRUE" get Name /format:list';
      exec(wmicCommand, (wmicError, wmicStdout) => {
        if (!wmicError && wmicStdout) {
          const lines = wmicStdout.split('\n');
          for (const line of lines) {
            if (line.startsWith('Name=')) {
              const printerName = line.substring(5).trim();
              if (printerName) {
                console.log('WMIC found default printer:', printerName);
                return callback(printerName);
              }
            }
          }
        }
        
        console.log('No default printer found');
        callback(null);
      });
    });
    
  } else {
    // Unix-like systems
    const command = 'lpstat -d';
    exec(command, (error, stdout) => {
      if (error) {
        console.log('Could not get default printer:', error.message);
        return callback(null);
      }
      
      const match = stdout.match(/system default destination: (.+)/);
      const defaultPrinter = match ? match[1].trim() : null;
      console.log('Unix default printer:', defaultPrinter);
      callback(defaultPrinter);
    });
  }
}

// Function to check if USB printer is available, with fallback to system printer
function checkPrinterAvailability(callback) {
  // On Windows, skip USB entirely and go straight to system printers
  if (os.platform() === 'win32' || !usbAvailable) {
    console.log('Checking system printers (USB skipped on Windows)...');
    
    detectAvailablePrinters((printers) => {
      if (printers.length > 0) {
        console.log('Found system printers:', printers);
        getDefaultPrinter((defaultPrinter) => {
          const printerToUse = defaultPrinter || printers[0];
          console.log(`Using system printer: ${printerToUse}`);
          callback({ 
            type: 'system', 
            printer: printerToUse, 
            available: true 
          });
        });
      } else {
        console.log('No printers found on system');
        callback({ 
          type: 'none', 
          printer: null, 
          available: false,
          message: 'No printers found. Please install a printer.'
        });
      }
    });
    return;
  }
  
  // Try USB printer first (non-Windows only)
  try {
    const device = new escpos.USB();
    callback({ 
      type: 'usb', 
      printer: 'USB Printer', 
      available: true 
    });
  } catch (usbError) {
    console.log('USB printer not available, checking system printers...');
    
    detectAvailablePrinters((printers) => {
      if (printers.length > 0) {
        getDefaultPrinter((defaultPrinter) => {
          const printerToUse = defaultPrinter || printers[0];
          console.log(`Fallback to system printer: ${printerToUse}`);
          callback({ 
            type: 'system', 
            printer: printerToUse, 
            available: true 
          });
        });
      } else {
        callback({ 
          type: 'none', 
          printer: null, 
          available: false,
          message: 'No USB or system printers available. Please set up a printer.'
        });
      }
    });
  }
}

// Helper function to get USB device with Windows compatibility
function getUSBDevice() {
  if (!escpos.USB) {
    throw new Error('USB adapter not available');
  }
  
  try {
    // For Windows, try to get device with additional error handling
    if (os.platform() === 'win32') {
      const device = new escpos.USB();
      
      // Override the device's open method to handle Windows-specific issues
      const originalOpen = device.open.bind(device);
      device.open = function(callback) {
        try {
          return originalOpen(callback);
        } catch (error) {
          if (error.message.includes('usb.on is not a function')) {
            console.error('Windows USB issue detected, trying alternative approach...');
            // Return a more descriptive error
            return callback(new Error('USB device not properly initialized on Windows. Please check driver installation.'));
          }
          return callback(error);
        }
      };
      
      return device;
    } else {
      return new escpos.USB();
    }
  } catch (error) {
    throw new Error(`Failed to create USB device: ${error.message}`);
  }
}

// Enhanced function to print with specific printer type preference
function printSendWithType(cmds, printerType, callback) {
  const res = {};
  
  console.log(`Print request for printer type: ${printerType}`);
  
  // Convert "UMUM" to "auto" for auto-detection
  if (printerType && printerType.toUpperCase() === 'UMUM') {
    printerType = 'auto';
    console.log('UMUM printer type converted to auto-detection');
  }
  
  // If specific printer type is requested, try that first
  if (printerType && printerType !== 'auto') {
    // Check if the requested printer exists in system printers
    detectAvailablePrinters((printers) => {
      const requestedPrinter = printers.find(p => 
        p.toLowerCase().includes(printerType.toLowerCase()) ||
        printerType.toLowerCase().includes(p.toLowerCase())
      );
      
      if (requestedPrinter) {
        console.log(`Using requested printer: ${requestedPrinter}`);
        printWithSystemPrinter(cmds, requestedPrinter, callback);
        return;
      } else {
        console.log(`Requested printer '${printerType}' not found, using auto-detection`);
        // Fall back to auto-detection
        printSend(cmds, callback);
      }
    });
  } else {
    // Use auto-detection
    printSend(cmds, callback);
  }
}

// Function to print directly to a specific system printer
function printWithSystemPrinter(cmds, printerName, callback) {
  const res = {};
  
  console.log(`Printing to system printer: ${printerName}`);
  
  try {
    // Create a temporary file and use system print command
    const tempFile = path.join(os.tmpdir(), `print_${Date.now()}.txt`);
    
    fs.writeFileSync(tempFile, cmds);
    console.log(`Created temp file: ${tempFile}`);
    console.log(`File content preview: ${cmds.substring(0, 100)}...`);
    
    let printCommand;
    if (os.platform() === 'win32') {
      // Try multiple Windows printing methods for better compatibility
      console.log(`Attempting to print to Windows printer: ${printerName}`);
      
      // Method 1: PowerShell (recommended for modern Windows)
      printCommand = `powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${printerName}'"`;
      
      exec(printCommand, (error, stdout, stderr) => {
        if (!error) {
          console.log('✅ PowerShell print successful');
          try { fs.unlinkSync(tempFile); } catch(e) {}
          res.message = `BERHASIL MENCETAK DATA (${printerName})`;
          res.status = 200;
          return callback(res);
        }
        
        console.log('⚠️ PowerShell print failed, trying notepad method:', error.message);
        
        // Method 2: Notepad print (fallback)
        const notepadCommand = `start /wait notepad /p "${tempFile}"`;
        exec(notepadCommand, (notepadError, notepadStdout, notepadStderr) => {
          if (!notepadError) {
            console.log('✅ Notepad print method initiated');
            setTimeout(() => {
              try { fs.unlinkSync(tempFile); } catch(e) {}
            }, 3000); // Wait longer for notepad to finish
            res.message = `BERHASIL MENCETAK DATA (${printerName}) - Notepad Method`;
            res.status = 200;
            return callback(res);
          }
          
          console.log('⚠️ Notepad print failed, trying print command:', notepadError.message);
          
          // Method 3: Traditional print command (final fallback)
          const printCmd = `print /D:"${printerName}" "${tempFile}"`;
          exec(printCmd, (printError, printStdout, printStderr) => {
            try { fs.unlinkSync(tempFile); } catch(e) {}
            
            if (printError) {
              console.error('❌ All Windows print methods failed. Error details:', {
                printerName,
                powershellError: error.message,
                notepadError: notepadError.message,
                printError: printError.message
              });
              res.message = `ERROR: Could not print to ${printerName}. Please check if printer is available and online.`;
              res.status = 500;
            } else {
              console.log('✅ Traditional print command successful');
              res.message = `BERHASIL MENCETAK DATA (${printerName}) - Print Command`;
              res.status = 200;
            }
            return callback(res);
          });
        });
      });
      
    } else {
      // Unix-like systems
      printCommand = `lp -d "${printerName}" "${tempFile}"`;
      
      exec(printCommand, (error, stdout, stderr) => {
        try { fs.unlinkSync(tempFile); } catch(e) {}
        
        if (error) {
          console.error('Unix print error:', error);
          res.message = `ERROR PRINTING TO ${printerName}: ${error.message}`;
          res.status = 500;
        } else {
          console.log('Unix print successful');
          res.message = `BERHASIL MENCETAK DATA (${printerName})`;
          res.status = 200;
        }
        return callback(res);
      });
    }
    
  } catch (e) {
    console.error(`ERROR SYSTEM PRINTER: ${e}`);
    res.message = `ERROR SYSTEM PRINTER: ${e.message}`;
    res.status = 500;
    return callback(res);
  }
}

function printSend(cmds, callback) {
  const res = {};

  // Check printer availability automatically
  checkPrinterAvailability((printerInfo) => {
    if (!printerInfo.available) {
      console.error("No printer available:", printerInfo.message);
      res.message = printerInfo.message || "NO PRINTER AVAILABLE";
      res.status = 500;
      return callback(res);
    }

    if (printerInfo.type === 'usb') {
      // Use USB printer
      try {
        const options = { encoding: "GB18030" };
        const device = getUSBDevice();
        const printer = new escpos.Printer(device, options);

        device.open((error) => {
          if (error) {
            console.error("Error saat membuka perangkat printer:", error);
            res.message = `ERROR MEMBUKA PERANGKAT PRINTER: ${error.message}`;
            res.status = 500;
            return callback(res);
          }

          try {
            printer.text(cmds).close();
            res.message = "BERHASIL MENCETAK DATA (USB)";
            res.status = 200;
            return callback(res);
          } catch (printError) {
            console.error("Error saat mencetak data:", printError);
            res.message = "ERROR MENCETAK DATA";
            res.status = 500;
            return callback(res);
          }
        });
      } catch (e) {
        console.error(`ERROR CONNECTION PRINTER: ${e}`);
        res.message = `ERROR CONNECTION PRINTER: ${e.message}`;
        res.status = 500;
        return callback(res);
      }
    } else if (printerInfo.type === 'system') {
      // Use system printer (fallback)
      console.log(`Using system printer: ${printerInfo.printer}`);
      
      // For system printers, we'll use a different approach
      // This could be enhanced to use node-printer or other system printing libraries
      try {
        // Create a temporary file and use system print command
        const tempFile = path.join(os.tmpdir(), `print_${Date.now()}.txt`);
        
        fs.writeFileSync(tempFile, cmds);
        
        let printCommand;
        if (os.platform() === 'win32') {
          printCommand = `print /D:"${printerInfo.printer}" "${tempFile}"`;
        } else {
          printCommand = `lp -d "${printerInfo.printer}" "${tempFile}"`;
        }
        
        exec(printCommand, (error, stdout, stderr) => {
          // Clean up temp file
          try { fs.unlinkSync(tempFile); } catch(e) {}
          
          if (error) {
            console.error('System print error:', error);
            res.message = `ERROR SYSTEM PRINT: ${error.message}`;
            res.status = 500;
          } else {
            res.message = `BERHASIL MENCETAK DATA (${printerInfo.printer})`;
            res.status = 200;
          }
          return callback(res);
        });
      } catch (e) {
        console.error(`ERROR SYSTEM PRINTER: ${e}`);
        res.message = `ERROR SYSTEM PRINTER: ${e.message}`;
        res.status = 500;
        return callback(res);
      }
    }
  });
}

function printResi(data, callback) {
  const res = {};

  // Check printer availability automatically
  checkPrinterAvailability((printerInfo) => {
    if (!printerInfo.available) {
      console.error("No printer available:", printerInfo.message);
      res.message = printerInfo.message || "NO PRINTER AVAILABLE";
      res.status = 500;
      return callback(res);
    }

    if (printerInfo.type === 'usb') {
      // Use USB printer for receipt
      try {
        const options = { encoding: "GB18030" };
        const device = getUSBDevice();
        const printer = new escpos.Printer(device, options);

        device.open((error) => {
          if (error) {
            console.error("Error saat membuka perangkat printer:", error);
            res.message = `ERROR MEMBUKA PERANGKAT PRINTER: ${error.message}`;
            res.status = 500;
            return callback(res);
          }

          try {
            var noResi = data.code;
            var receiptName = data.receipt;
            var productName = data.product;
            console.log(noResi);
            printer
              .font('a')
              .align('LT')
              .print(`${"\x1b\x21\x00"}`)
              .print(`NO RESI : ${noResi}`)
              .newLine()
              .print(`PENERIMA : ${receiptName}`)
              .newLine()
              .print(productName)
              .newLine()
              .align('ct')
              // .barcode(noResi, 'CODE128')
              .qrcode(noResi)
              .size(1, 1)
              .text(noResi)
              .newLine()
              .newLine()
              .newLine()
              .cut()
              .close();
            res.message = "BERHASIL MENCETAK DATA (USB)";
            res.status = 200;
            return callback(res);
          } catch (printError) {
            console.error("Error saat mencetak data:", printError);
            res.message = "ERROR MENCETAK DATA";
            res.status = 500;
            return callback(res);
          }
        });
      } catch (e) {
        console.error(`ERROR CONNECTION PRINTER: ${e}`);
        res.message = `ERROR CONNECTION PRINTER: ${e.message}`;
        res.status = 500;
        return callback(res);
      }
    } else if (printerInfo.type === 'system') {
      // Use system printer for receipt (simplified version)
      console.log(`Using system printer for receipt: ${printerInfo.printer}`);
      
      try {
        var noResi = data.code;
        var receiptName = data.receipt;
        var productName = data.product;
        
        // Create simplified receipt text for system printer
        const receiptText = `
=============================
           RECEIPT           
=============================
NO RESI : ${noResi}
PENERIMA : ${receiptName}
${productName}
=============================
           ${noResi}        
=============================


`;
        
        const tempFile = path.join(os.tmpdir(), `receipt_${Date.now()}.txt`);
        
        fs.writeFileSync(tempFile, receiptText);
        
        let printCommand;
        if (os.platform() === 'win32') {
          printCommand = `print /D:"${printerInfo.printer}" "${tempFile}"`;
        } else {
          printCommand = `lp -d "${printerInfo.printer}" "${tempFile}"`;
        }
        
        exec(printCommand, (error, stdout, stderr) => {
          // Clean up temp file
          try { fs.unlinkSync(tempFile); } catch(e) {}
          
          if (error) {
            console.error('System print error:', error);
            res.message = `ERROR SYSTEM PRINT: ${error.message}`;
            res.status = 500;
          } else {
            res.message = `BERHASIL MENCETAK RECEIPT (${printerInfo.printer})`;
            res.status = 200;
          }
          return callback(res);
        });
      } catch (e) {
        console.error(`ERROR SYSTEM PRINTER: ${e}`);
        res.message = `ERROR SYSTEM PRINTER: ${e.message}`;
        res.status = 500;
        return callback(res);
      }
    }
  });
}
// Endpoint to get print data (mimics the sales/view endpoint structure)
app.get('/sales/view/:idTrx.txt', (req, res) => {
  const idTrx = req.params.idTrx;
  const printerType = req.query.printerType || 'auto';
  // Convert "UMUM" to "auto" for auto-detection
  const normalizedPrinterType = printerType.toUpperCase() === 'UMUM' ? 'auto' : printerType;
  const struckType = req.query.struckType || 'true';
  
  console.log(`Print request for transaction: ${idTrx}, printer: ${printerType} (normalized: ${normalizedPrinterType}), type: ${struckType}`);
  
  // Here you would normally get the transaction data from database
  // For now, return sample receipt data
  const receiptData = `
=============================
         RECEIPT           
=============================
TRX ID    : ${idTrx}
DATE      : ${new Date().toLocaleDateString()}
TIME      : ${new Date().toLocaleTimeString()}
PRINTER   : ${normalizedPrinterType}
TYPE      : ${struckType}
=============================
ITEM                   QTY  
Product Sample          1   
Sub Total          : 10.00
Tax               :  1.00
Total             : 11.00
=============================
      Thank You!        
=============================


`;
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(receiptData);
});

// Endpoint to check printer status
app.get('/printer-status', (req, res) => {
  checkPrinterAvailability((printerInfo) => {
    res.json({
      available: printerInfo.available,
      type: printerInfo.type,
      printer: printerInfo.printer,
      message: printerInfo.message || 'Printer ready'
    });
  });
});

// Endpoint to list all available printers
app.get('/printers', (req, res) => {
  detectAvailablePrinters((printers) => {
    getDefaultPrinter((defaultPrinter) => {
      res.json({
        printers: printers,
        defaultPrinter: defaultPrinter,
        usbAvailable: usbAvailable && os.platform() !== 'win32',
        platform: os.platform(),
        windowsSystemPrinterOnly: os.platform() === 'win32'
      });
    });
  });
});

app.get('/', (req, res) => {
  var dataSend = req.query;
  console.log(dataSend);
  printResi(dataSend, (result) => {
      console.log(result);
    });
  res.send('Hello World! - Direct Print Server with Auto Printer Detection')
})

io.on('connection', (socket) => {
  console.log('✅ WebSocket user connected:', socket.id);
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);
  });
  
  socket.on('print', (data) => {
    console.log('🖨️ Print request received from:', socket.id, data);
    
    try {
      // Extract printer type and data from frontend request
      let printerType = data.printerType || 'auto'; // Default to auto-detection
      
      // Convert "UMUM" to "auto" for auto-detection
      if (printerType.toUpperCase() === 'UMUM') {
        printerType = 'auto';
        console.log('🔄 UMUM printer type detected, using auto-detection');
      }
      
      const dataPrint = data.dataPrint;
      
      if (!dataPrint) {
        console.log('❌ No data to print');
        socket.emit('print-response', {
          message: 'NO DATA TO PRINT',
          status: 400
        });
        return;
      }
      
      console.log('🚀 Starting print process...');
      
      // Use the enhanced printSend function with printer type preference
      printSendWithType(dataPrint, printerType, (result) => {
        try {
          console.log('📄 Print result:', result);
          
          // Check if socket is still connected before emitting
          if (socket.connected) {
            socket.emit('print-response', result);
            console.log('✅ Print response sent to client');
          } else {
            console.log('⚠️ Socket disconnected, cannot send response');
          }
        } catch (emitError) {
          console.error('❌ Error sending print response:', emitError);
        }
      });
      
    } catch (printError) {
      console.error('❌ Error in print handler:', printError);
      
      // Send error response if socket is still connected
      if (socket.connected) {
        socket.emit('print-response', {
          message: `PRINT ERROR: ${printError.message}`,
          status: 500
        });
      }
    }
  });
  
  // Add ping/pong to keep connection alive
  socket.on('ping', () => {
    console.log('🏓 Ping received from:', socket.id);
    socket.emit('pong');
  });
});

server.listen(4000, () => {
  console.log('✅ Direct Print Server running on http://localhost:4000');
  console.log('🖨️ Auto printer detection enabled');
  console.log('🌐 WebSocket server ready for connections');
});

// Handle uncaught exceptions to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.log('🔄 Server continuing to run...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Server continuing to run...');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('🛑 Server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Server terminating...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});