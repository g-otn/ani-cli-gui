import Box from '@suid/material/Box';
import CircularProgress from '@suid/material/CircularProgress';

const Loading = () => (
  <Box sx={{ display: 'grid' }} alignItems="center" justifyContent="center">
    <CircularProgress />
  </Box>
);

export default Loading;
