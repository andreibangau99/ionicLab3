import React from 'react';
import {IonCol, IonImg, IonItem, IonLabel} from '@ionic/react';
import { JediProps } from './JediProps';
import {usePhotoGallery} from "../forPhoto/usePhotoGallery";

interface JediPropsExt extends JediProps {
  onEdit: (id?: string) => void;
}

const Jedi: React.FC<JediPropsExt> = ({ _id, name, onEdit }) => {

  return (
    <IonItem  onClick={() => onEdit(_id)}>
      <IonLabel>{name}</IonLabel>

    </IonItem>


  );
};

export default Jedi;
