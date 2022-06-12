import Box from '@suid/material/Box';
import Card from '@suid/material/Card';
import CardActionArea from '@suid/material/CardActionArea';
import CardMedia from '@suid/material/CardMedia';
import Typography from '@suid/material/Typography';
import { Component } from 'solid-js';
import { Anime } from '../api/searching';

const AnimeCard: Component<{ anime: Anime; onClick: () => void }> = ({
  anime,
  onClick,
}) => {
  return (
    <Card sx={{ width: 180 }} onClick={onClick}>
      <CardActionArea sx={{ height: '100%' }}>
        <Box height={252} sx={{ display: 'flex' }} justifyContent="center">
          <CardMedia component="img" image={anime.picture} alt={anime.name} />
        </Box>
        <Box
          p={1}
          height={60}
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          sx={{ display: 'grid' }}
        >
          <Typography variant="caption" overflow="hidden">
            {anime.name}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default AnimeCard;
