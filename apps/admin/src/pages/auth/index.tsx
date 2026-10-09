import * as React from 'react';
import { AuthPage as MUIAuthPage, type AuthProps } from '@refinedev/mui';
import Box from '@mui/material/Box';
import { LogoIcon } from '../../components/icons/logo.js';

const authWrapperProps = {
  style: {
    background:
      "radial-gradient(50% 50% at 50% 50%,rgba(255, 255, 255, 0) 0%,rgba(0, 0, 0, 0.21) 100%),url('images/login-bg.jpg')",
    backgroundSize: 'cover',
  },
};

const renderAuthContent = (content: React.ReactNode) => {
  return (
    <div>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="12px"
        marginBottom="16px"
      >
        <LogoIcon
          style={{
            width: 64,
            height: 64,
            color: '#6D8040',
          }}
        />
        <Box
          sx={{
            fontWeight: 'bold',
            fontSize: '42px',
            textUnderlinePosition: 'none',
            textDecoration: 'none',
            color: '#6D8040',
          }}
        >
          WabiSaviArt
        </Box>
      </Box>
      {content}
    </div>
  );
};

export const AuthPage: React.FC<AuthProps> = ({ type, formProps }) => {
  return (
    <MUIAuthPage
      type={type}
      wrapperProps={authWrapperProps}
      renderContent={renderAuthContent}
      formProps={formProps}
      forgotPasswordLink={false}
      registerLink={false}
    />
  );
};
