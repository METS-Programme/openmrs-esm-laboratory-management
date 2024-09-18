export interface ILaboratoryNavigation {
  title?: string;
  showDateInHeader?: boolean;
}

export interface ILaboratoryNavigationProps {
  onPageChanged: (navigationInfo?: ILaboratoryNavigation) => void;
}
