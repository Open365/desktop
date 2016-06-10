#!/bin/sh
set -e
set -u
set -x

SETTINGS=dist/scripts/settingsStatic.*
SETTINGS_TO_IMPORT=(
    "VDI_RECONNECTION_RETRY_TIME"
    "VDI_RECONNECTION_FREEZE_TIME"
    "VDI_RECONNECTION_CANCEL_TIME"
    "VDI_RECONNECTION_FREEZE"
    "EYETHEME_NAME"
    "SHOW_VIDEOCONFERENCE"
    "CHECK_ACTIVITY_INTERVAL"
    "EYEOS_DISABLE_ANALYTICS"
    "SUPPORT_HIGH_DPI"
    "LOCALIZATION_DOWNLOAD_CLIENT_ACTIVE"
)

config_settings() {
	local variable="$1"
	local value="${!variable:-}"

	if [ -n "$value" ]; then
		re='^[0-9]+$'
		if ! [[ "$value" =~ $re ]] ; then
			if [ "$value" != 'true' ] && [ "$value" != 'false' ];then
				value="'$value'"
			fi
		fi

		if grep "\b$variable\b" $SETTINGS ; then
			sed -i "s/,'$variable': '[^']*'/,'$variable': $value/" $SETTINGS
		else
			sed -i "s/}/\t,'$variable': $value\n}/" $SETTINGS
		fi
	else
		sed -i "s/,'$variable'.*'//" $SETTINGS
	fi
}

for i in "${SETTINGS_TO_IMPORT[@]}"
do
	config_settings "$i"
done

while true
do
	sleep 9999d
done
