import React from "react";
import { SideNavItem } from "./side-nav-item";
import { SideNav, SideNavItems } from "@carbon/react";
import styles from "./side-nav.scss";
import SideNavLinkItem from "./side-nav-link.component";

interface SideNavProps {
  tabs: SideNavItem[];
  selectedIndex?: number;
  onSelectTab: (index: number) => void;
}

const SideNavItemsList: React.FC<SideNavProps> = ({
  tabs,
  selectedIndex,
  onSelectTab,
}) => {
  return (
    <SideNav
      isFixedNav
      expanded={true}
      isChildOfHeader={true}
      aria-label="Side navigation"
      className={styles.leftNav}
    >
      <SideNavItems>
        {tabs.map((tab: SideNavItem, index: number) => (
          <SideNavLinkItem
            key={index}
            tab={tab}
            index={index}
            onSelectTab={onSelectTab}
          ></SideNavLinkItem>
        ))}
      </SideNavItems>
    </SideNav>
  );
};

export default SideNavItemsList;
