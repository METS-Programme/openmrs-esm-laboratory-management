import React, { useEffect, useState } from "react";
import { SideNavItem } from "./side-nav-item";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import styles from "./side-nav.scss";
import { navigate } from "@openmrs/esm-framework";
import SideNavLinkItem from "./side-nav-link.component";
import { useLocation, useParams } from "react-router-dom";

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
