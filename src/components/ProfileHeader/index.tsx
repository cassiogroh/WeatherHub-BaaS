import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';

import { Container, Button } from './styles';

interface ProfileHeaderProps {
  currentPage: string;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ currentPage }) => {
  const { signOut } = useAuth();
  const history = useHistory();

  const handleNavigateToStationsPage = useCallback(() => {
    history.push('dashboard')
  }, [history]);

  const handleNavigateToProfileInfo = useCallback(() => {
    history.push('profile')
  }, [history]);

  const handleNavigateToInfo = useCallback(() => {
    history.push('info')
  }, [history]);

  return (
    <Container>
      <Button
        currentPage={currentPage}
        pageName='Estações'
        position={1}
        type='button'
        onClick={handleNavigateToStationsPage}
      >
        <p>Estações</p>
      </Button>

      <Button
        currentPage={currentPage}
        pageName='Perfil'
        position={2}
        type='button'
        onClick={handleNavigateToProfileInfo}
      >
        <p>Perfil</p>
      </Button>

      <Button
        currentPage={currentPage}
        pageName='Info'
        position={3}
        type='button'
        onClick={handleNavigateToInfo}
      >
        <p>Info</p>
      </Button>

      <Button
        position={4}
        type='button'
        onClick={signOut}
      >
        <p>Logout</p>
      </Button>
    </Container>
  )
}

export default ProfileHeader;