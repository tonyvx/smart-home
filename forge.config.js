const packager = require('electron-packager');
const rebuild = require('electron-rebuild');

module.exports = {
    packagerConfig: {
        ignore: '^/react-app'
    },

    electronRebuildConfig: {

    },
    hooks: {
        prePackage: async () => { console.log("prePackage: this is prepackage step."); },
        afterCopy: (buildPath, electronVersion, platform, arch, callback) => {
            rebuild({ buildPath, electronVersion, arch })
                .then(() => console.log("afterCopy"))
                .catch((error) => console.log("afterCopy", error));
        },
        postPackage: async (forgeConfig, options) => {
            if (options.spinner) {
                options.spinner.info(`postPackage: Completed packaging for ${options.platform} / ${options.arch} at ${options.outputPaths[0]}`);
            }
        },
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "smart_home"
            }
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                options: {
                    name: "Smart Home",
                    productName: "Smart Home",
                    icon: "/home/avalantra/projects/smart-home/public/smart-home.png",
                    categories: [
                        "Utility",
                        "Office"
                    ],
                    maintainer: "tonyvx",
                    homepage: "http://valantra.org"
                }
            }
        }
    ]
}
