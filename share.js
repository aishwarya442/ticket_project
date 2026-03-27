const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("Starting global share links for your Drama Tickets App...");
    
    try {
        // 1. Tunnel the Backend Database (Port 8000)
        const backendTunnel = await localtunnel({ port: 8000 });
        console.log(`✅ Secure Database tunnel established!`);

        // 2. Temporarily rewrite AppContext.js to point to the secure public backend URL
        const appContextPath = path.join(__dirname, 'frontend', 'src', 'context', 'AppContext.js');
        let appData = fs.readFileSync(appContextPath, 'utf8');
        
        // Backup original 
        if (!fs.existsSync(appContextPath + '.backup')) {
            fs.writeFileSync(appContextPath + '.backup', appData);
        } else {
            appData = fs.readFileSync(appContextPath + '.backup', 'utf8');
        }
        
        // Replace the API base URL with the new public one
        appData = appData.replace(/baseURL: `http:\/\/\$\{window\.location\.hostname\}:8000\/api\/`,/, `baseURL: '${backendTunnel.url}/api/',`);
        fs.writeFileSync(appContextPath, appData);

        // 3. Tunnel the Frontend Website (Port 3000)
        const frontendTunnel = await localtunnel({ port: 3000 });
        console.log(`\n🎉 SUCCESS! Send this exact link to your friend:\n\n🚀 👉  ${frontendTunnel.url}  👈 🚀\n`);
        console.log("They can open it on their phone from ANYWHERE in the world!");
        console.log("As you change code in VS Code, their phone will automatically update live.");
        console.log("\nPress Ctrl + C when you are done sharing to safely close the connection.");

        // Restore on exit
        process.on('SIGINT', () => {
            console.log("\nClosing tunnels and restoring local code...");
            if (fs.existsSync(appContextPath + '.backup')) {
                fs.copyFileSync(appContextPath + '.backup', appContextPath);
                fs.unlinkSync(appContextPath + '.backup');
            }
            backendTunnel.close();
            frontendTunnel.close();
            process.exit();
        });
    } catch (err) {
        console.error("Error creating tunnels. Make sure React and Django are running first!", err);
    }
})();
