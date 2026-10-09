import { ThemedSider } from '@refinedev/mui';
import { Title } from '../title';
// import { useLocation, useNavigate } from 'react-router';

export const CustomSider = () => {
  // const navigate = useNavigate();
  // const location = useLocation();

  // const handlePlatformInsights = () => {
  //   void navigate('/insights/admin');
  // };

  return (
    <ThemedSider
      Title={Title}
      render={({ items }) => {
        return (
          <>
            {items}
            {/* Platform Insights - simple link, no dropdown */}
            {/* <List component="div" disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                onClick={handlePlatformInsights}
                sx={{
                  pl: 2,
                  backgroundColor:
                    location.pathname === '/insights/admin'
                      ? 'action.selected'
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="Platform Insights" />
              </ListItemButton>
            </List> */}
          </>
        );
      }}
    />
  );
};
