#!/bin/bash

# add all changed files to a changeset
git add .
# and commit them with a ***NO_CI*** to ensure it doesn't trigger another build
echo "[command] git commit -m ***NO_CI*** updated version number ${SETVARS_PACKAGE_VERSION}"
git commit -m "***NO_CI*** updated version number ${SETVARS_PACKAGE_VERSION}"

echo "[command] git push"
git push