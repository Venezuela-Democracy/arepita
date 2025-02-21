import React, { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { VENEZUELA_REGIONS, VENEZUELA_REGIONS_DISPLAY } from '../constants';
import { Loading } from '../components/shared/Loading';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 16px;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid var(--tg-theme-hint-color);
  border-radius: 4px;
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
`;

const Option = styled.option`
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
`;

const Button = styled.button`
  padding: 12px;
  border: none;
  border-radius: 4px;
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Register = () => {
  const { register, isRegistering, registerError } = useUser();
  const [language, setLanguage] = useState('es');
  const [region, setRegion] = useState('CARACAS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ region, language });
  };

  if (isRegistering) {
    return <Loading />;
  }

  return (
    <RegisterContainer>
      <h1>Registro</h1>
      <Form onSubmit={handleSubmit}>
        <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <Option value="es">Español</Option>
          <Option value="en">English</Option>
        </Select>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          {Object.entries(VENEZUELA_REGIONS).map(([key]) => (
            <Option key={key} value={key}>
              {VENEZUELA_REGIONS_DISPLAY[key as keyof typeof VENEZUELA_REGIONS_DISPLAY]}
            </Option>
          ))}
        </Select>
        <Button type="submit" disabled={isRegistering}>
          {isRegistering ? 'Registrando...' : 'Registrar'}
        </Button>
        {registerError && <p style={{ color: 'red' }}>{registerError.message}</p>}
      </Form>
    </RegisterContainer>
  );
}; 