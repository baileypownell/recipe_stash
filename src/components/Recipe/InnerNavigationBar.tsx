import { ArrowBackIosRoundedIcon } from '@icons';
import { ActionIcon, Title, Group
} from '@mantine/core';
import { useNavigate } from 'react-router';

interface Props {
  title: string;
}

const InnerNavigationBar = ({ title }: Props) => {
  const navigate = useNavigate();
  return (
    <Group>
      <ActionIcon color="gray" onClick={() => navigate('/recipes')}>
        <ArrowBackIosRoundedIcon />
      </ActionIcon>
      <Title order={6}>{title}</Title>
    </Group>
  );
};

export default InnerNavigationBar;
