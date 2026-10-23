import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./DropdownMenu.js";
import { Button } from "./Button.js";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar.js";
type AccountAction = "profile" | "settings" | "sign-out";
type AccountMenuProps = IDensityProps & {
  name: string;
  email?: string;
  image?: string;
  onAction: (action: AccountAction) => void;
};
function AccountMenu({ name, email, image, onAction, density }: AccountMenuProps): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" density={density} />}
        aria-label={`Account menu for ${name}`}
      >
        <Avatar className="size-control">
          <AvatarImage src={image} alt="" />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span>{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent density={density} align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{email ?? name}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onAction("profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("settings")}>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction("sign-out")}>Sign out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export { AccountMenu };
export type { AccountMenuProps, AccountAction };
