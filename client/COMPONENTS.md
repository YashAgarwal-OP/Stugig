# StuGig Component Library

> Generated from the Stitch "StuGig | Design System Reference" screen tokens.
> All future prompts reference components by the **Name** column — no re-describing styles.

---

## Atoms

| Name | File | Props / Variants | Used on Stitch Screens |
|---|---|---|---|
| **Button** | `atoms/Button.jsx` | `variant`: primary · secondary · ghost · accent · danger · disabled; `size`: sm · md · lg; `iconLeft`, `iconRight` | All screens |
| **Input** | `atoms/Input.jsx` | `error` (boolean); standard HTML input props | Sign Up, Login, Post a Job, Bidding |
| **TextArea** | `atoms/Input.jsx` | `error`, `rows` | Post a Job, Messages, Review Modal |
| **Select** | `atoms/Input.jsx` | `error` | Post a Job, Filter Panel |
| **PasswordInput** | `atoms/PasswordInput.jsx` | Show/hide toggle, `error` | Sign Up, Login |
| **Badge** | `atoms/Badge.jsx` | `variant`: primary · secondary · accent · neutral | Browse Services, Job Listings, Public Profile |
| **StatusPill** | `atoms/Badge.jsx` | `status`: open · pending · in-progress · completed · paid · refunded · rejected · accepted · disputed | Job Listings, Client Dashboard, Payment, Admin Panel |
| **Avatar** | `atoms/Avatar.jsx` | `src`, `name` (fallback initials), `size`: xs · sm · md · lg · xl | All authenticated screens |
| **StarRating** | `atoms/Avatar.jsx` | `value`, `max`, `interactive`, `onChange`, `size` | Public Profile, Review Modal, Browse Services |
| **Checkbox** | `atoms/Checkbox.jsx` | `label`, `error`; standard checkbox props | Filter Panel, Review Modal |
| **RadioCard** | `atoms/Checkbox.jsx` | `value`, `name`, `checked`, `onChange`, `label`, `description`, `icon` | Sign Up (role selection) |

---

## Molecules

| Name | File | Props / Variants | Used on Stitch Screens |
|---|---|---|---|
| **Card** | `molecules/Card.jsx` | `elevated`, `hover`; generic container | All dashboards |
| **StatCard** | `molecules/Card.jsx` | `label`, `value`, `icon`, `trend` | Freelancer Dashboard, Client Dashboard, Admin Panel |
| **ServiceCard** | `molecules/Card.jsx` | `service` object, `onClick` | Browse Services |
| **JobCardRow** | `molecules/Card.jsx` | `job` object, `onClick` | Job Listings (list view) |
| **JobCardGrid** | `molecules/Card.jsx` | `job` object, `matchScore`, `onClick` | Job Listings (grid / Matchmaker results) |
| **ReviewListItem** | `molecules/Card.jsx` | `review` object | Public Profile |
| **TransactionRow** | `molecules/Card.jsx` | `payment` object | Payment & History |
| **PortfolioCard** | `molecules/Card.jsx` | `item` object, `onDelete` | Freelancer Dashboard, Public Profile |
| **FormField** | `molecules/FormField.jsx` | `label`, `htmlFor`, `error`, `hint`, `required`; wraps any input atom | All forms |
| **SearchBar** | `molecules/SearchBar.jsx` | `placeholder`, `value`, `onChange`, `onSubmit` | Browse Services, Job Listings |
| **FilterPanel** | `molecules/SearchBar.jsx` | `categories[]`, `filters`, `onFilterChange` | Browse Services, Job Listings |
| **FileDropzone** | `molecules/FileDropzone.jsx` | `accept`, `multiple`, `onFiles`, `label` | Post a Job, Sign Up (portfolio) |
| **TagInput** | `molecules/TagInput.jsx` | `value[]`, `onChange`, `placeholder`, `maxTags` | Sign Up (skills), Edit Profile |
| **AIFeatureCard** | `molecules/AIFeatureCard.jsx` | `title`, `description`, `icon`, `action`, `children` — gradient-border sparkle wrapper | Freelancer Dashboard (Matchmaker + Bidding Assistant) |
| **Modal** | `molecules/Modal.jsx` | `open`, `onClose`, `title`, `size`: sm · md · lg · xl | Review Modal, any future dialogs |
| **Table** | `molecules/Table.jsx` | `columns[]` (key, label, sortable, render), `rows[]`, `onRowClick` | Admin Panel (users), Payment History, Bid List |
| **ChartLine** | `molecules/ChartLine.jsx` | `data[]` (with values), `xKey`, `yKey`, `height` | Admin Overview (revenue-over-time) |

---

## Organisms

| Name | File | Props / Variants | Used on Stitch Screens |
|---|---|---|---|
| **PublicNavbar** | `organisms/PublicNavbar.jsx` | None (self-contained links) | Landing Page, Browse Services, Job Listings (logged-out) |
| **DashboardShell** | `organisms/DashboardShell.jsx` | `navItems[]` {label, to, icon}; `children` | Freelancer Dashboard, Client Dashboard, Admin Panel, Messages, Payment |
| **ProfileHeaderBanner** | `organisms/ProfileHeader.jsx` | `user` object, `coverUrl` | Public Profile |
| **TabBar** | `organisms/ProfileHeader.jsx` | `tabs[]` {key, label}, `activeTab`, `onTabChange` | Public Profile, Admin Panel |
| **ConversationListItem** | `organisms/Chat.jsx` | `thread` {jobTitle, otherUser, lastMessage, unread}, `active`, `onClick` | Messages & Chat |
| **MessageBubble** | `organisms/Chat.jsx` | `message` {text, createdAt, sender}, `isOwn` | Messages & Chat |
| **TypingIndicator** | `organisms/Chat.jsx` | `name` | Messages & Chat |
| **ChatInputBar** | `organisms/Chat.jsx` | `onSend`, `disabled` | Messages & Chat |
| **Footer** | `organisms/Footer.jsx` | None (self-contained links) | Landing Page |

---

## Design Tokens Reference (from Stitch)

| Token | Value |
|---|---|
| Primary (Deep Indigo) | `#3525cd` |
| Primary Container | `#4f46e5` |
| Primary Light | `#e2dfff` |
| Secondary (Vibrant Teal) | `#006a61` |
| Secondary Container | `#86f2e4` |
| Accent (Warm Amber) | `#a44100` |
| Accent Container | `#ffdbcc` |
| AI Sparkle | `#8B5CF6` |
| Surface | `#f8f9fa` |
| On Surface | `#191c1d` |
| Muted | `#464555` |
| Outline | `#777587` |
| Border | `#c7c4d8` |
| Error | `#ba1a1a` |
| Headline Font | Montserrat 700 |
| Body Font | Inter 400/500/600 |
| Card Radius | 16px (`rounded-2xl`) |
| Button Radius | 8px (`rounded-lg`) |
| Pill Radius | 9999px (`rounded-full`) |

---

## Style Guide Route

Visit `/style-guide` when the dev server is running to see every component variant rendered live.
