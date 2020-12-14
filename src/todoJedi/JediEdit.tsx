import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage, IonSelect, IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { JediContext } from './JediProvider';
import { RouteComponentProps } from 'react-router';
import { JediProps } from './JediProps';

const log = getLogger('JediEdit');

interface JediEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const JediEdit: React.FC<JediEditProps> = ({ history, match }) => {
  const { jedis, saving, savingError, saveItem } = useContext(JediContext);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [jedi, setJedi] = useState<JediProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = jedis?.find(it => it._id === routeId);
    setJedi(item);
    if (item) {
      setName(item.name);
      setGender(item.gender);
    }
  }, [match.params.id, jedis]);
  const handleSave = () => {
    const editedJedi = jedi ? { ...jedi, name ,gender} : { name ,gender};
    saveItem && saveItem(editedJedi).then(() => history.goBack());
  };
  log('render');
  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonInput value={name} placeholder="name" onIonChange={e => setName(e.detail.value || '')} />
          {/*<IonInput value={gender} placeholder="gender" onIonChange={e => setGender(e.detail.value || '')} />*/}
          <IonSelect value={gender} placeholder="gender" okText="Okay" cancelText="Dismiss"
                     onIonChange={e => setGender(e.detail.value) }>
            <IonSelectOption value="M">M</IonSelectOption>
            <IonSelectOption value="F">F</IonSelectOption>
          </IonSelect>
          <IonLoading isOpen={saving} />
          {savingError && (
              <div>{savingError.message || 'Failed to save todoJedi'}</div>
          )}
        </IonContent>
      </IonPage>
  );
};

export default JediEdit;
