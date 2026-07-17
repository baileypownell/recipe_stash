import type { CSSProperties } from 'react';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCirclePlus,
  IconClipboardCopy,
  IconCopy,
  IconEdit,
  IconFilter,
  IconHome,
  IconLayoutGrid,
  IconList,
  IconLogin,
  IconLogout,
  IconMenu2,
  IconPhotoUp,
  IconPlus,
  IconSettings,
  IconToolsKitchen2,
  IconTrash,
  IconUser,
  IconUserPlus,
  IconX,
  IconMail,
  IconShieldLock,
  IconDotsVertical,
} from '@tabler/icons-react';

type IconProps = {
  sx?: CSSProperties | Record<string, unknown>;
  style?: CSSProperties;
  fontSize?: string | number;
};

const wrap = (Icon: typeof IconPlus) => {
  const WrappedIcon = ({ sx, style, fontSize, ...props }: IconProps) => (
    <Icon
      size={typeof fontSize === 'number' ? fontSize : 22}
      stroke={1.9}
      style={{ ...(sx as CSSProperties), ...style }}
      {...props}
    />
  );
  return WrappedIcon;
};

export const AddIcon = wrap(IconPlus);
export const AddCircleRoundedIcon = wrap(IconCirclePlus);
export const ArrowBackIosRoundedIcon = wrap(IconChevronLeft);
export const ArrowBackIosNewRoundedIcon = wrap(IconChevronLeft);
export const ArrowForwardIosRoundedIcon = wrap(IconChevronRight);
export const BlenderRoundedIcon = wrap(IconAlertTriangle);
export const CancelRoundedIcon = wrap(IconX);
export const ChevronRightRoundedIcon = wrap(IconChevronRight);
export const ClearIcon = wrap(IconX);
export const CloseRoundedIcon = wrap(IconX);
export const ContentCopyRoundedIcon = wrap(IconCopy);
export const DeleteOutlineRoundedIcon = wrap(IconTrash);
export const DeleteRoundedIcon = wrap(IconTrash);
export const DoubleArrowRoundedIcon = wrap(IconChevronRight);
export const EditRoundedIcon = wrap(IconEdit);
export const EmailRoundedIcon = wrap(IconMail);
export const ExpandMoreIcon = wrap(IconChevronDown);
export const FilterListRoundedIcon = wrap(IconFilter);
export const HomeRoundedIcon = wrap(IconHome);
export const LoginRoundedIcon = wrap(IconLogin);
export const LogoutRoundedIcon = wrap(IconLogout);
export const MenuRoundedIcon = wrap(IconMenu2);
export const MoreVertRoundedIcon = wrap(IconDotsVertical);
export const PersonAddAltRoundedIcon = wrap(IconUserPlus);
export const PersonRoundedIcon = wrap(IconUser);
export const AccountCircleRoundedIcon = wrap(IconUser);
export const RestaurantRoundedIcon = wrap(IconToolsKitchen2);
export const SecurityRoundedIcon = wrap(IconShieldLock);
export const SettingsApplicationsRoundedIcon = wrap(IconSettings);
export const TableRowsRoundedIcon = wrap(IconList);
export const UploadFileRoundedIcon = wrap(IconPhotoUp);
export const ViewModuleRoundedIcon = wrap(IconLayoutGrid);
