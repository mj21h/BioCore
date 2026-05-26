package com.biohacker.app;

import android.app.AlarmManager;
import android.content.Context;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@CapacitorPlugin(name = "AlarmSync")
public class AlarmSyncPlugin extends Plugin {

    @PluginMethod
    public void getNextAlarm(PluginCall call) {
        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            AlarmManager.AlarmClockInfo nextAlarm = alarmManager.getNextAlarmClock();
            if (nextAlarm != null) {
                long triggerTime = nextAlarm.getTriggerTime();
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
                String formattedTime = sdf.format(new Date(triggerTime));
                
                JSObject ret = new JSObject();
                ret.put("time", formattedTime);
                ret.put("timestamp", triggerTime);
                call.resolve(ret);
                return;
            }
        }
        
        // Fallback: Check Settings provider for system next alarm formatted
        try {
            String nextAlarmString = Settings.System.getString(context.getContentResolver(), "next_alarm_formatted");
            if (nextAlarmString != null && !nextAlarmString.isEmpty()) {
                java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d{2}):(\\d{2})").matcher(nextAlarmString);
                if (matcher.find()) {
                    String formattedTime = matcher.group(1) + ":" + matcher.group(2);
                    JSObject ret = new JSObject();
                    ret.put("time", formattedTime);
                    call.resolve(ret);
                    return;
                }
            }
        } catch (Exception e) {
            // Ignore format exception
        }

        JSObject ret = new JSObject();
        ret.put("time", null);
        call.resolve(ret);
    }
}
