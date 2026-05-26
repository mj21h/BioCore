package com.biohacker.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AlarmSyncPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
