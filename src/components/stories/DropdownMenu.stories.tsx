import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../DropdownMenu";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useState, type ReactElement } from "react";
import {
  BellIcon,
  MailIcon,
  MessageSquareIcon,
  CreditCardIcon,
  WalletIcon,
  Building2Icon,
  FileIcon,
  SaveIcon,
  TrashIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../Avatar";
import { fixture_avatarImage } from "./fixtures";

type IconMenuProps = { hasIcons?: boolean };

export const AnchorWidth: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Choose a workspace action</DropdownMenuTrigger>
      <DropdownMenuContent width="anchor">
        <DropdownMenuGroup>
          <DropdownMenuItem>Open</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Choose a workspace action" });
    await userEvent.click(trigger);
    const menu = await within(canvasElement.ownerDocument.body).findByRole("menu");
    await waitFor(() =>
      expect(Math.abs(menu.getBoundingClientRect().width - trigger.getBoundingClientRect().width)).toBeLessThanOrEqual(
        1,
      ),
    );
    await userEvent.keyboard("{Escape}");
  },
};

export const IconTriggerContentWidth: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon-sm" aria-label="Track actions" />}>
        <FileIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Remove from collection…</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Track actions" }));
    const item = await within(canvasElement.ownerDocument.body).findByRole("menuitem", {
      name: "Remove from collection…",
    });
    const text = canvasElement.ownerDocument.createRange();
    text.selectNodeContents(item);
    await expect(text.getClientRects()).toHaveLength(1);
    await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);
    await userEvent.keyboard("{Escape}");
  },
};

function NotificationMenu({ hasIcons = false }: IconMenuProps): ReactElement {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [push, setPush] = useState(true);
  return (
    <div className="flex flex-col items-start gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Notification preferences</DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={email} onCheckedChange={setEmail}>
              {hasIcons && <MailIcon aria-hidden="true" />}Email notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={sms} onCheckedChange={setSms}>
              {hasIcons && <MessageSquareIcon aria-hidden="true" />}SMS notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={push} onCheckedChange={setPush}>
              {hasIcons && <BellIcon aria-hidden="true" />}Push notifications
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <output aria-label="Notification preferences" dir="ltr">
        {JSON.stringify({ email, sms, push })}
      </output>
    </div>
  );
}

function PaymentMenu({ hasIcons = false }: IconMenuProps): ReactElement {
  const [payment, setPayment] = useState("card");
  return (
    <div className="flex flex-col items-start gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Payment method</DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Payment</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={payment} onValueChange={setPayment}>
              <DropdownMenuRadioItem value="card">
                {hasIcons && <CreditCardIcon aria-hidden="true" />}Credit card
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="wallet">
                {hasIcons && <WalletIcon aria-hidden="true" />}Wallet
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bank">
                {hasIcons && <Building2Icon aria-hidden="true" />}Bank transfer
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <output aria-label="Payment method">{payment}</output>
    </div>
  );
}

async function exerciseNotifications(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole("button", { name: "Notification preferences" });
  await userEvent.click(trigger);
  const sms = await body.findByRole("menuitemcheckbox", { name: "SMS notifications" });
  await userEvent.click(sms);
  await expect(sms).toHaveAttribute("aria-checked", "true");
  await userEvent.click(body.getByRole("menuitemcheckbox", { name: "Email notifications" }));
  await expect(body.getByRole("menuitemcheckbox", { name: "Push notifications" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(canvas.getByRole("status", { name: "Notification preferences" })).toHaveTextContent(
    '{"email":false,"sms":true,"push":true}',
  );
  await userEvent.click(trigger);
  await expect(await body.findByRole("menuitemcheckbox", { name: "SMS notifications" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
}

async function exercisePayment(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole("button", { name: "Payment method" });
  await userEvent.click(trigger);
  await expect(await body.findByRole("menuitemradio", { name: "Credit card" })).toHaveAttribute("aria-checked", "true");
  await userEvent.click(body.getByRole("menuitemradio", { name: "Bank transfer" }));
  await expect(body.getByRole("menuitemradio", { name: "Bank transfer" })).toHaveAttribute("aria-checked", "true");
  await expect(body.getByRole("menuitemradio", { name: "Credit card" })).toHaveAttribute("aria-checked", "false");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(canvas.getByRole("status", { name: "Payment method" })).toHaveTextContent("bank");
  await expect(trigger).toHaveFocus();
}

const onSelect = fn();
const contentClassName = fn(() => "font-normal");
const itemClassName = fn(() => "font-normal");
const labelClassName = fn(() => "font-normal");
const subTriggerClassName = fn(() => "font-normal");
const subContentClassName = fn(() => "font-normal");
const checkboxClassName = fn(() => "font-normal");
const radioClassName = fn(() => "font-normal");
const separatorClassName = fn(() => "font-normal");
const meta: Meta<typeof DropdownMenu> = {
  title: "shadcn-alexgorbatchev/components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs", "test"],
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Project menu</DropdownMenuTrigger>
      <DropdownMenuContent className={contentClassName}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className={labelClassName}>Project</DropdownMenuLabel>
          <DropdownMenuItem className={itemClassName} onClick={onSelect}>
            Open<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={subTriggerClassName}>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={subContentClassName}>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onSelect}>Copy link</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className={separatorClassName} />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem className={checkboxClassName} defaultChecked>
            Notifications
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup defaultValue="daily">
          <DropdownMenuRadioItem value="daily">Daily</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className={radioClassName} value="weekly">
            Weekly
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={onSelect}>
            Delete project
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

async function exerciseMenu(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const menu = await body.findByRole("menu");
  await expect(within(menu).getByRole("menuitem", { name: "Archive" })).toHaveAttribute("aria-disabled", "true");
  await expect(contentClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
  await expect(itemClassName).toHaveBeenCalledWith(expect.any(Object));
  await expect(labelClassName).toHaveBeenCalledWith(expect.any(Object));
  await expect(separatorClassName).toHaveBeenCalledWith(expect.any(Object));
  const checkbox = within(menu).getByRole("menuitemcheckbox", { name: "Notifications" });
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await userEvent.click(checkbox);
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
  await expect(checkboxClassName).toHaveBeenCalledWith(expect.objectContaining({ checked: false }));
  await userEvent.click(within(menu).getByRole("menuitemradio", { name: "Weekly" }));
  await expect(radioClassName).toHaveBeenCalledWith(expect.objectContaining({ checked: true }));
  await userEvent.click(within(menu).getByRole("menuitem", { name: "Share" }));
  await userEvent.click(await body.findByRole("menuitem", { name: "Copy link" }));
  await expect(subTriggerClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
  await expect(subContentClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
  await expect(onSelect).toHaveBeenCalled();
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(canvas.getByRole("button", { name: "Project menu" })).toHaveFocus();
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Project menu" }));
    await exerciseMenu(canvasElement);
  },
};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "480px" } } },
  play: async ({ canvasElement }) => exerciseMenu(canvasElement),
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Project menu" });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    await expect(getComputedStyle(menu).direction).toBe("rtl");
    await waitFor(() =>
      expect(Math.abs(menu.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThanOrEqual(
        1,
      ),
    );
    const checkbox = within(menu).getByRole("menuitemcheckbox", { name: "Notifications" });
    const indicator = checkbox.querySelector("svg")!;
    await expect(indicator.getBoundingClientRect().right).toBeLessThan(
      checkbox.getBoundingClientRect().left + checkbox.getBoundingClientRect().width / 2,
    );
    const checkedStyle = getComputedStyle(checkbox);
    await expect(parseFloat(checkedStyle.paddingLeft)).toBeGreaterThan(parseFloat(checkedStyle.paddingRight));
    const radio = within(menu).getByRole("menuitemradio", { name: "Daily" });
    await expect(radio.querySelector("svg")!.getBoundingClientRect().right).toBeLessThan(
      radio.getBoundingClientRect().left + radio.getBoundingClientRect().width / 2,
    );
    const shortcut = within(menu).getByText("⌘O");
    await expect(shortcut.getBoundingClientRect().right).toBeLessThan(
      menu.getBoundingClientRect().left + menu.getBoundingClientRect().width / 2,
    );
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const RightToLeftSubmenu: Story = {
  decorators: RightToLeft.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Project menu" }));
    const share = await body.findByRole("menuitem", { name: "Share" });
    await userEvent.click(share);
    const copy = await body.findByRole("menuitem", { name: "Copy link" });
    const submenu = copy.closest('[role="menu"]')!;
    await waitFor(() =>
      expect(submenu.getBoundingClientRect().right).toBeLessThanOrEqual(share.getBoundingClientRect().left + 1),
    );
    await expect(getComputedStyle(submenu).direction).toBe("rtl");
    const arrow = share.querySelector("svg")!;
    await expect(arrow.getBoundingClientRect().right).toBeLessThan(
      share.getBoundingClientRect().left + share.getBoundingClientRect().width / 2,
    );
    await expect(arrow.getScreenCTM()!.a).toBeLessThan(0);
    await userEvent.click(copy);
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Project menu" })).toHaveFocus();
  },
};

export const RightToLeftInset: Story = {
  decorators: RightToLeft.decorators,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Inset menu</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel inset>Document actions</DropdownMenuLabel>
          <DropdownMenuItem inset>
            New document<DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Share document</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>Copy document link</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Inset menu" });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    for (const element of [
      within(menu).getByText("Document actions"),
      within(menu).getByRole("menuitem", { name: "New document Ctrl+N" }),
      within(menu).getByRole("menuitem", { name: "Share document" }),
    ]) {
      const style = getComputedStyle(element);
      await expect(parseFloat(style.paddingRight)).toBeGreaterThan(parseFloat(style.paddingLeft));
    }
    await userEvent.click(within(menu).getByRole("menuitem", { name: "New document Ctrl+N" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Payload: Story = {
  render: () => (
    <DropdownMenu<string>>
      {({ payload }) => (
        <>
          <DropdownMenuTrigger<string> payload="Project alpha" render={<Button variant="outline" />}>
            Alpha actions
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{payload?.toUpperCase()}</DropdownMenuLabel>
              <DropdownMenuItem>Open project</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </>
      )}
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Alpha actions" });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    await waitFor(() => expect(within(menu).getByText("PROJECT ALPHA")).toBeVisible());
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Open project" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Checkboxes: Story = {
  render: () => <NotificationMenu />,
  play: ({ canvasElement }) => exerciseNotifications(canvasElement),
};
export const CheckboxIcons: Story = {
  render: () => <NotificationMenu hasIcons />,
  play: async ({ canvasElement }) => {
    await exerciseNotifications(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Notification preferences" }));
    const sms = await within(canvasElement.ownerDocument.body).findByRole("menuitemcheckbox", {
      name: "SMS notifications",
    });
    const icons = sms.querySelectorAll("svg");
    await expect(icons).toHaveLength(2);
    const leading = icons[1]!;
    const indicator = icons[0]!;
    await expect(leading).toHaveAttribute("aria-hidden", "true");
    await expect(leading.getBoundingClientRect().width).toBe(16);
    await expect(Math.abs(leading.getBoundingClientRect().x - indicator.getBoundingClientRect().x)).toBeGreaterThan(32);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const RightToLeftCheckboxIcons: Story = { ...CheckboxIcons, decorators: RightToLeft.decorators };
export const RadioGroup: Story = {
  render: () => <PaymentMenu />,
  play: ({ canvasElement }) => exercisePayment(canvasElement),
};
export const RadioIcons: Story = {
  render: () => <PaymentMenu hasIcons />,
  play: async ({ canvasElement }) => {
    await exercisePayment(canvasElement);
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Payment method" }));
    const selected = await body.findByRole("menuitemradio", { name: "Bank transfer" });
    const icons = selected.querySelectorAll("svg");
    await expect(icons).toHaveLength(2);
    await expect(Math.abs(icons[0]!.getBoundingClientRect().x - icons[1]!.getBoundingClientRect().x)).toBeGreaterThan(
      32,
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const RightToLeftRadioIcons: Story = { ...RadioIcons, decorators: RightToLeft.decorators };

export const Icons: Story = {
  render: function Render() {
    const [action, setAction] = useState("No action");
    return (
      <div className="flex flex-col items-start gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>File actions</DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>File</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setAction("Created")}>
                <FileIcon aria-hidden="true" />
                New file<DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("Saved")}>
                <SaveIcon aria-hidden="true" />
                Save<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <output aria-label="File action">{action}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "File actions" });
    await userEvent.click(trigger);
    const save = await body.findByRole("menuitem", { name: "Save Ctrl+S" });
    await waitFor(() => expect(save).toBeVisible());
    await expect(save.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(save.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
    await userEvent.click(save);
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "File action" })).toHaveTextContent("Saved");
    await expect(trigger).toHaveFocus();
  },
};
export const RightToLeftIcons: Story = { ...Icons, decorators: RightToLeft.decorators };

export const Destructive: Story = {
  render: function Render() {
    const [isPresent, setIsPresent] = useState(true);
    return (
      <div className="flex flex-col items-start gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Draft actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Discard draft</DropdownMenuLabel>
              <DropdownMenuItem variant="destructive" disabled={!isPresent} onClick={() => setIsPresent(false)}>
                <TrashIcon aria-hidden="true" />
                Discard draft
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <output aria-label="Draft status">{isPresent ? "Draft available" : "Draft discarded"}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Draft actions" });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("menuitem", { name: "Discard draft" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Draft status" })).toHaveTextContent("Draft discarded");
    await userEvent.click(trigger);
    await expect(await body.findByRole("menuitem", { name: "Discard draft" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};

export const AvatarAccount: Story = {
  render: function Render() {
    const [action, setAction] = useState("Signed in");
    return (
      <div className="flex flex-col items-start gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Account menu" render={<Button variant="ghost" size="icon" />}>
            <Avatar>
              <AvatarImage src={fixture_avatarImage} alt="Alex" />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Alex</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setAction("Account settings opened")}>
                <SettingsIcon aria-hidden="true" />
                Account settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setAction("Signed out")}>
                <LogOutIcon aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <output aria-label="Account status">{action}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Account menu" });
    await waitFor(() => expect(canvas.getByRole("img", { name: "Alex" })).toBeVisible());
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await body.findByRole("menu");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Account settings" })).toHaveFocus());
    await userEvent.keyboard("{End}{Enter}");
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Account status" })).toHaveTextContent("Signed out");
    await expect(trigger).toHaveFocus();
  },
};
export const RightToLeftAvatarAccount: Story = { ...AvatarAccount, decorators: RightToLeft.decorators };

export const Complex: Story = {
  render: function Render() {
    const [action, setAction] = useState("No action");
    const [sidebar, setSidebar] = useState(true);
    const [theme, setTheme] = useState("light");
    const [push, setPush] = useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Workspace actions</DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>File</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setAction("Created")}>
                <FileIcon aria-hidden="true" />
                New file<DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Recent projects</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Recent</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setAction("Alpha opened")}>Alpha</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>More projects</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => setAction("Gamma opened")}>Gamma</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>View</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
                Show sidebar
              </DropdownMenuCheckboxItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SettingsIcon aria-hidden="true" />
                  Settings
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <BellIcon aria-hidden="true" />
                        Notifications
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuCheckboxItem checked={push} onCheckedChange={setPush}>
                            <BellIcon aria-hidden="true" />
                            Push notifications
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <output aria-label="Workspace preferences" dir="ltr">
          {JSON.stringify({ action, sidebar, theme, push })}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Workspace actions" });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("menuitem", { name: "Recent projects" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "More projects" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Gamma" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("menuitemcheckbox", { name: "Show sidebar" }));
    await userEvent.click(body.getByRole("menuitem", { name: "Theme" }));
    await userEvent.click(await body.findByRole("menuitemradio", { name: "Dark" }));
    await userEvent.keyboard("{Escape}{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("menuitem", { name: "Settings" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Notifications" }));
    const push = await body.findByRole("menuitemcheckbox", { name: "Push notifications" });
    await userEvent.click(push);
    await expect(push).toHaveAttribute("aria-checked", "true");
    await expect(canvas.getByRole("status", { name: "Workspace preferences" })).toHaveTextContent(
      '{"action":"Gamma opened","sidebar":false,"theme":"dark","push":true}',
    );
    await userEvent.keyboard("{Escape}{Escape}{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const RightToLeftComplex: Story = { ...Complex, decorators: RightToLeft.decorators };
