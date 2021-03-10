import styles from './GoLive.m.less';
import { ModalLayout } from '../../shared/ModalLayout';
import { Button } from 'antd';
import { useOnCreate, useOnDestroy } from '../../hooks';
import { Services } from '../../service-provider';
import GoLiveSettings from './GoLiveSettings';
import React from 'react';
import { $t } from '../../../services/i18n';
import GoLiveChecklist from './GoLiveChecklist';
import Form, { useForm } from '../../shared/inputs/Form';
import Animation from 'rc-animate';
import { SwitchInput } from '../../shared/inputs';
import { useGoLiveSettings } from './go-live';

export default function GoLiveWindow() {
  console.log('render GoLiveWindow');
  const { StreamingService, WindowsService, StreamSettingsService } = Services;
  const form = useForm();
  const {
    contextValue,
    Context: GoLiveSettingsContext,
    error,
    lifecycle,
    info,
    enabledPlatforms,
    isMultiplatformMode,
    goLive,
    isAdvancedMode,
    switchAdvancedMode,
  } = useGoLiveSettings('GoLiveWindow');

  const shouldShowConfirm = lifecycle === 'waitForNewSettings' && enabledPlatforms.length > 0;
  const shouldShowSettings = ['empty', 'prepopulate', 'waitForNewSettings'].includes(lifecycle);
  const shouldShowChecklist = ['runChecklist', 'live'].includes(lifecycle);
  const shouldShowAdvancedSwitch = shouldShowConfirm && isMultiplatformMode;
  const shouldShowGoBackButton =
    lifecycle === 'runChecklist' && error && info.checklist.startVideoTransmission !== 'done';

  // prepopulate data for all platforms
  useOnCreate(() => {
    if (['empty', 'waitingForNewSettings'].includes(lifecycle)) {
      console.log('Prepopulate');
      StreamingService.actions.prepopulateInfo();
    }
  });

  // clear failed checks and warnings on window close
  useOnDestroy(() => {
    // if (info.checklist.startVideoTransmission !== 'done') {
    //   StreamingService.actions.resetInfo();
    // }
  });

  function close() {
    WindowsService.actions.closeChildWindow();
  }

  function goBackToSettings() {
    StreamingService.actions.prepopulateInfo();
  }

  function render() {
    return (
      <GoLiveSettingsContext.Provider value={contextValue}>
        <ModalLayout footer={renderFooter()}>
          <Form
            form={form}
            style={{ position: 'relative', height: '100%' }}
            layout="horizontal"
            name="editStreamForm"
          >
            <Animation transitionName="slideright">
              {/* STEP 1 - FILL OUT THE SETTINGS FORM */}
              {shouldShowSettings && (
                <GoLiveSettings
                  key={'settings'}
                  className={styles.page}
                  // settings={settings}
                  // updateSettings={updateSettings}
                />
              )}

              {/* STEP 2 - RUN THE CHECKLIST */}
              {shouldShowChecklist && <GoLiveChecklist className={styles.page} key={'checklist'} />}
            </Animation>
          </Form>
        </ModalLayout>
      </GoLiveSettingsContext.Provider>
    );
  }

  function renderFooter() {
    return (
      <Form layout={'inline'}>
        <SwitchInput
          label={$t('Show Advanced Settings')}
          name="advancedMode"
          onChange={switchAdvancedMode}
          value={isAdvancedMode}
          debounce={300}
        />

        {/* CLOSE BUTTON */}
        <Button onClick={close}>{$t('Close')}</Button>

        {/* GO BACK BUTTON */}
        {shouldShowGoBackButton && (
          <Button onClick={goBackToSettings}>{$t('Go back to settings')}</Button>
        )}

        {/* GO LIVE BUTTON */}
        {shouldShowConfirm && (
          <Button type="primary" onClick={goLive}>
            {$t('Confirm & Go Live')}
          </Button>
        )}
      </Form>
    );
  }

  return render();
}
