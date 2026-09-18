const { withPodfile } = require('expo/config-plugins');

const POST_INSTALL_MARKER = '  post_install do |installer|\n';

module.exports = function withIosPodDeploymentTarget(config) {
  const deploymentTarget = config.ios?.deploymentTarget ?? '15.1';
  const rubyDeploymentTarget = JSON.stringify(deploymentTarget);

  return withPodfile(config, podfile => {
    if (podfile.modResults.contents.includes('Secret Notez minimum iOS deployment target')) {
      return podfile;
    }

    const postInstallPatch = `    # Secret Notez minimum iOS deployment target\n    installer.pods_project.targets.each do |target|\n      target.build_configurations.each do |build_configuration|\n        build_configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = ${rubyDeploymentTarget}\n      end\n    end\n`;

    if (!podfile.modResults.contents.includes(POST_INSTALL_MARKER)) {
      throw new Error('Could not find the CocoaPods post_install hook.');
    }

    podfile.modResults.contents = podfile.modResults.contents.replace(
      POST_INSTALL_MARKER,
      `${POST_INSTALL_MARKER}${postInstallPatch}`,
    );

    return podfile;
  });
};
