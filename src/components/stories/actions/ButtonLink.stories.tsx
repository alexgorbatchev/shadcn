import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, MouseEvent, ReactElement } from "react";
import { ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { expect, fn, within } from "storybook/test";
import { AnalyticsProvider } from "../../analytics/index.js";
import { Button } from "../../Button";
import { ButtonLink } from "../../ButtonLink";
import { ClientRouterLink } from "../helpers";

interface IAppLinkProps extends Omit<ComponentProps<"a">, "href"> {
  to: string;
}

function AppLink({ to, ...props }: IAppLinkProps): ReactElement {
  return <a href={to} data-router-link="" {...props} />;
}

const clientNavigate = fn();
const trackLinkActivation = fn();

const BUTTON_STYLE_PROPERTIES = [
  "height",
  "minWidth",
  "paddingInlineStart",
  "paddingInlineEnd",
  "columnGap",
  "backgroundColor",
  "color",
  "borderTopColor",
  "borderTopWidth",
  "borderTopLeftRadius",
  "fontSize",
  "fontWeight",
  "textDecorationLine",
  "justifyContent",
] as const;

async function expectButtonAppearance(link: HTMLElement, button: HTMLElement): Promise<void> {
  const linkStyle = getComputedStyle(link);
  const buttonStyle = getComputedStyle(button);
  for (const property of BUTTON_STYLE_PROPERTIES) {
    await expect({ property, value: linkStyle[property] }).toEqual({ property, value: buttonStyle[property] });
  }
}

const VARIANTS = ["default", "outline", "secondary", "ghost", "destructive", "success", "warning", "link"] as const;
const TEXT_SIZES = ["xs", "sm", "default", "lg"] as const;
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

const meta: Meta<typeof ButtonLink> = {
  title: "@alexgorbatchev/shadcn/components/actions/ButtonLink",
  component: ButtonLink,
  tags: ["autodocs", "test"],
  args: {
    href: "#docs",
    children: "Docs",
    onClick: fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()),
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    size: { control: "select", options: ["default", "content", ...TEXT_SIZES, ...ICON_SIZES] },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Docs" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "#docs");
    await expect(link).toHaveAttribute("data-slot", "button-link");
    await expect(link).not.toHaveAttribute("role");
    await expect(link).not.toHaveAttribute("type");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Outline: Story = { ...Default, args: { variant: "outline" } };

export const Variants: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="contents">
          <ButtonLink {...args} variant={variant}>{`${variant} link`}</ButtonLink>
          <Button variant={variant}>{`${variant} button`}</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const variant of VARIANTS) {
      await expectButtonAppearance(
        canvas.getByRole("link", { name: `${variant} link` }),
        canvas.getByRole("button", { name: `${variant} button` }),
      );
    }
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 items-center gap-4">
      {TEXT_SIZES.map((size) => (
        <div key={size} className="contents">
          <ButtonLink {...args} size={size}>{`${size} link`}</ButtonLink>
          <Button size={size}>{`${size} button`}</Button>
        </div>
      ))}
      {ICON_SIZES.map((size) => (
        <div key={size} className="contents">
          <ButtonLink {...args} size={size} aria-label={`${size} link`}>
            <ArrowRightIcon />
          </ButtonLink>
          <Button size={size} aria-label={`${size} button`}>
            <ArrowRightIcon />
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of [...TEXT_SIZES, ...ICON_SIZES]) {
      const link = canvas.getByRole("link", { name: `${size} link` });
      const button = canvas.getByRole("button", { name: `${size} button` });
      await expectButtonAppearance(link, button);
      await expect(link.getBoundingClientRect().height).toBe(button.getBoundingClientRect().height);
    }
    const iconLink = canvas.getByRole("link", { name: "icon link" }).getBoundingClientRect();
    await expect(iconLink.width).toBe(iconLink.height);
  },
};

export const CompactDensity: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <ButtonLink {...args} density="compact">
        Compact link
      </ButtonLink>
      <Button density="compact">Compact button</Button>
      <ButtonLink {...args} density="comfortable">
        Comfortable link
      </ButtonLink>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const compact = canvas.getByRole("link", { name: "Compact link" });
    await expect(compact).toHaveAttribute("data-density", "compact");
    await expectButtonAppearance(compact, canvas.getByRole("button", { name: "Compact button" }));
    await expect(compact.getBoundingClientRect().height).toBeLessThan(
      canvas.getByRole("link", { name: "Comfortable link" }).getBoundingClientRect().height,
    );
  },
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      <ButtonLink {...args} aria-label="Leading link">
        <BookOpenIcon data-icon="inline-start" data-testid="ButtonLink--leading-icon" />
        <span>Docs</span>
      </ButtonLink>
      <Button aria-label="Leading button">
        <BookOpenIcon data-icon="inline-start" />
        <span>Docs</span>
      </Button>
      <ButtonLink {...args} aria-label="Trailing link">
        <span>Next</span>
        <ArrowRightIcon data-icon="inline-end" data-testid="ButtonLink--trailing-icon" />
      </ButtonLink>
      <Button aria-label="Trailing button">
        <span>Next</span>
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  ),
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const leading = canvas.getByRole("link", { name: "Leading link" });
    const trailing = canvas.getByRole("link", { name: "Trailing link" });
    await expectButtonAppearance(leading, canvas.getByRole("button", { name: "Leading button" }));
    await expectButtonAppearance(trailing, canvas.getByRole("button", { name: "Trailing button" }));
    const leadingIcon = canvas.getByTestId("ButtonLink--leading-icon").getBoundingClientRect();
    const trailingIcon = canvas.getByTestId("ButtonLink--trailing-icon").getBoundingClientRect();
    await expect(leadingIcon.width).toBe(16);
    await expect(leadingIcon.right).toBeLessThan(within(leading).getByText("Docs").getBoundingClientRect().left);
    await expect(trailingIcon.left).toBeGreaterThan(within(trailing).getByText("Next").getBoundingClientRect().right);
    await userEvent.click(trailing);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const routerNavigate = fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
export const RouterLink: Story = {
  args: { variant: "outline", ref: fn() },
  render: ({ href: _href, ...args }) => (
    <div className="flex items-center gap-4">
      <ButtonLink {...args} render={<AppLink to="/staging" onClick={routerNavigate} />}>
        Open Staging
      </ButtonLink>
      <Button variant="outline">Outline button</Button>
    </div>
  ),
  play: async ({ canvasElement, args, userEvent }) => {
    routerNavigate.mockClear();
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Open Staging" });
    await expect(link).toHaveAttribute("href", "/staging");
    await expect(link).toHaveAttribute("data-router-link");
    await expect(link).toHaveAttribute("data-slot", "button-link");
    await expect(link).not.toHaveAttribute("role");
    await expect(link).toHaveTextContent("Open Staging");
    await expect(args.ref).toHaveBeenCalledWith(link);
    await expectButtonAppearance(link, canvas.getByRole("button", { name: "Outline button" }));
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(routerNavigate).toHaveBeenCalledOnce();
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const RouterLinkAnalytics: Story = {
  args: { onClick: fn() },
  decorators: [
    (Story) => (
      <AnalyticsProvider enabled transport={{ track: trackLinkActivation }}>
        <Story />
      </AnalyticsProvider>
    ),
  ],
  render: ({ href: _href, ...args }) => (
    <div className="flex items-center gap-4">
      <ButtonLink {...args} render={<ClientRouterLink to="/plans" onNavigate={clientNavigate} />}>
        Plans
      </ButtonLink>
      <ButtonLink
        {...args}
        render={
          <ClientRouterLink to="/blocked" onNavigate={clientNavigate} onClick={(event) => event.preventDefault()} />
        }
      >
        Blocked
      </ButtonLink>
    </div>
  ),
  play: async ({ canvasElement, args, userEvent }) => {
    clientNavigate.mockClear();
    trackLinkActivation.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: "Plans" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(clientNavigate).toHaveBeenCalledWith("/plans");
    await expect(trackLinkActivation).toHaveBeenCalledOnce();
    await expect(trackLinkActivation).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ui.activate", component: "ButtonLink" }),
    );
    await userEvent.click(canvas.getByRole("link", { name: "Blocked" }));
    await expect(clientNavigate).toHaveBeenCalledOnce();
    await expect(trackLinkActivation).toHaveBeenCalledOnce();
  },
};

export const RenderCallback: Story = {
  args: { density: "compact" },
  render: (args) => (
    <ButtonLink {...args} render={(props, state) => <a {...props} title={`${state.slot} ${state.density}`} />}>
      Docs
    </ButtonLink>
  ),
  play: async ({ canvasElement, args, userEvent }) => {
    const link = within(canvasElement).getByRole("link", { name: "Docs" });
    await expect(link).toHaveAttribute("title", "button-link compact");
    await expect(link).toHaveAttribute("href", "#docs");
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const TruncatedLabel: Story = {
  args: { truncate: true, children: "A very long playlist title that must fit its container" },
  decorators: [
    (Story) => (
      <div className="w-36">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, args, userEvent }) => {
    const link = within(canvasElement).getByRole("link", {
      name: "A very long playlist title that must fit its container",
    });
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(144);
    await expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth);
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const FullWidthStartAligned: Story = {
  args: { fullWidth: true, align: "start", variant: "outline", children: "Open settings" },
  decorators: [
    (Story) => (
      <section aria-label="Link area" className="w-96">
        <Story />
      </section>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Open settings" });
    await expect(link.getBoundingClientRect().width).toBe(
      canvas.getByRole("region", { name: "Link area" }).getBoundingClientRect().width,
    );
    const range = link.ownerDocument.createRange();
    range.selectNodeContents(link);
    const style = getComputedStyle(link);
    await expect(range.getBoundingClientRect().left).toBeCloseTo(
      link.getBoundingClientRect().left + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
      1,
    );
  },
};
