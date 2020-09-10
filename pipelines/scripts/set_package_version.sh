#!/bin/bash

VERSION=${SETVARS_PACKAGE_VERSION}
INCREMENTED=false

if [ "${SETVARS_SKIP_BUILD}" == "true" ] || [ "${BUILD_REASON}" == "Scheduled" ] || [ "${BUILD_REASON}" == "PullRequest" ]; then
	VERSION=$(node -pe "require('./package.json').version")
	echo "[set_package_version] fixing version number at: ${VERSION}"
fi

# if a version number was not extracted from the build meta information, take it from the existing package version
if [[ -z "${VERSION}" ]]; then
	# Update the main package with a new patch version
	#  major and minor version updates should be done manually after a release. Only the top level package.json needs to be updated for this
	VERSION=$(npm version patch --no-git-tag-version)
	# trim the package version so we just have major.minor.patch
	VERSION=$(echo ${VERSION} | cut -c 2-)

	echo "[set_package_version] incremented version: ${VERSION}"
fi

# validate the package_version
REGEX="^([1-9][0-9]+|[0-9])\.([1-9][0-9]+|[0-9])\.([1-9][0-9]+|[0-9])$";
if ! [[ ${VERSION} =~ ${REGEX} ]]; then
	echo "[set_package_version] invalid version format: ${VERSION}"
	exit 1
fi

# run lerna version to update the individual packages
#  --force-publish: Ensures that every package is updated even if there haven't been any updates to it's code
#  --no-git-tag-version: prevents a git tag and push - because we'll do it later ourselves (we have more to commit)
#  --yes: says yes automatically to the confirmation question
lerna version ${VERSION} --force-publish --no-git-tag-version --yes
# use sed to replace the version number in our swagger generator, as this won't be done by lerna
#  SED does not support the non-greedy operator .*?, so an explicit [^'] is required
sed -i '' -e "s/version: '[^']*',/version: '${VERSION}',/g" ./packages/util.build.swagger/lib/swagger/ProviderApi.js
sed -i '' -e "s/version: '[^']*',/version: '${VERSION}',/g" ./packages/util.build.swagger/lib/swagger/ProviderDemo.js

key="PACKAGE_VERSION"
# one way or another, we now have a version number. Export that again so the rest of the pipeline can make use of it
echo "[set_package_version] SETTING ${key}=${VERSION}"
echo "##vso[task.setvariable variable=${key};isOutput=true]${VERSION}"

# if package_version was set in build meta, this step means our environment.sh will have the value twice. But they'll be the same
echo "echo \"[environment] SETTING ${key}=${VERSION}\"" >> ./build/environment.sh
echo "echo \"##vso[task.setvariable variable=${key};isOutput=true]${VERSION}\"" >> ./build/environment.sh