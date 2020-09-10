#!/bin/bash

mkdir -p ./build
echo "#!/bin/bash" >> ./build/environment.sh


# default deploy_env to '' as it makes some comparisions easier in the pipeline
echo "Setting Defaults"
echo "##vso[task.setvariable variable=DEPLOY_ENV;isOutput=true]none"

extract_meta_info() {
    # depending on the type of build we're doing, we might pull meta information from different sources. For standard builds based on a 
    #  push to git; the last commit has the various meta we want. Whereas with a manual build that data comes from the META_ variables
    #  set on the build itself. For some other build reasons, we don't want any special behaviour at all (e.g. scheduled, pr)

    if [ "${BUILD_REASON}" == "Manual" ]; then
        echo "setting meta_info for manual build"
        # extract from META_ build variables
        for varname in ${!META_*}
        do
	    echo "found variable: ${varname}"
            key=${varname#META_}    # get the name of the key without the META_ prefix
            value=${!varname}       # get the value of the variable

            # append the key and value to our meta info
            EXTRACTED_INFO="${EXTRACTED_INFO}***${key}: ${value}***"
        done
    elif [ "${BUILD_REASON}" == "Scheduled" ] || [ "${BUILD_REASON}" == "PullRequest" ]; then
        echo "setting meta_info for scheduled/pr build"
        EXTRACTED_INFO=""
        # don't set any values, we want build only
    else
        echo "setting meta_info from last commit"
        # take from commit message
        EXTRACTED_INFO="$(git log -1 --pretty=%B | tr "\n" "%")"
    fi
}

REGEX="\*\*\*([a-zA-Z0-9_-]*)(:[ ]*([. a-zA-Z0-9_-]*))?\*\*\*";
global_rematch() {
    local s=$1 regex=$2

    while [[ ${s} =~ ${regex} ]]; do
  		key="${BASH_REMATCH[1]}"
  		value="${BASH_REMATCH[3]:-true}"

  		echo "[extract_build_meta] SETTING ${key}=${value}"
  		echo "##vso[task.setvariable variable=${key};isOutput=true]${value}"

        echo "echo \"[environment] SETTING ${key}=${value}\"" >> ./build/environment.sh
        echo "echo \"##vso[task.setvariable variable=${key};isOutput=true]${value}\"" >> ./build/environment.sh

        s=${s#*"${BASH_REMATCH[0]}"}
    done
}

echo "[extract_build_meta] START extracting meta information"
EXTRACTED_INFO=""
extract_meta_info
echo "[extract_build_meta] END extracting meta information: ${EXTRACTED_INFO}"

echo "[extract_build_meta] START searching for output variables in meta information"
global_rematch "${EXTRACTED_INFO}" "${REGEX}"
echo "[extract_build_meta] END searching for output variables in meta information"
