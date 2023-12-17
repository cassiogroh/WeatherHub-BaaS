import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';

import { Container, Button } from './styles';

interface ProfileHeaderProps {
  currentPage: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ currentPage }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigateToStationsPage = useCallback(() => {
    navigate('dashboard')
  }, [navigate]);

  const handleNavigateToProfileInfo = useCallback(() => {
    navigate('profile')
  }, [navigate]);

  const handleNavigateToInfo = useCallback(() => {
    navigate('info')
  }, [navigate]);

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
        <p>Sair</p>
      </Button>
    </Container>
  )
}

export default ProfileHeader;