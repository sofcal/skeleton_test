#!/bin/bash

echo "[set_git_environment] setting git identity"
git config user.email "sfab_bankingcloud@sage.com"
git config user.name "sfab_bankingcloud"

echo "[set_git_environment] extracting usable branch name from ${BUILD_SOURCEBRANCH}"

if [[ ${BUILD_SOURCEBRANCH} == refs/pull* ]]; then
   USABLE_BRANCH_NAME=${BUILD_SOURCEBRANCH/refs\/pull\//}
else
   USABLE_BRANCH_NAME=${BUILD_SOURCEBRANCH/refs\/heads\//}
fi;

echo "[set_git_environment] extracted usable branch name: ${USABLE_BRANCH_NAME}"

echo "##vso[task.setvariable variable=USABLE_BRANCH_NAME]${USABLE_BRANCH_NAME}"

echo "[set_git_environment] checking out branch to allow versioning"
git fetch
git checkout "${USABLE_BRANCH_NAME}"