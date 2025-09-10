export interface TaskProps {
  title: string;
}

export type TaskHeaderType = React.FC<
  Pick<TaskProps, "title"> & { isExpanded: boolean; setIsExpanded: () => void }
>;
