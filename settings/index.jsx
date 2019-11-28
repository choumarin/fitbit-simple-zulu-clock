function mySettings(props) {
  return (
    <Page>
        <Toggle
          settingsKey="alwaysOnToggle"
          label="Always on display"
        />
      <Section>
        <Toggle
          settingsKey="nightModeToggle"
          label="Night mode"
        />
        <Select
          label="Start"
          settingsKey="nightModeStart"
          options={[
            {name:"18:00"},
            {name:"19:00"},
            {name:"20:00"},
            {name:"21:00"},
            {name:"22:00"},
            {name:"23:00"},
            {name:"00:00"},
            {name:"01:00"},
          ]}
        />
        <Select
          label="End"
          settingsKey="nightModeEnd"
          options={[
            {name:"04:00"},
            {name:"05:00"},
            {name:"06:00"},
            {name:"07:00"},
            {name:"08:00"},
            {name:"09:00"},
            {name:"10:00"},
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);