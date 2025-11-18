import "./style/mousePosition.css";

type Props = {
  mouseLonLat: number[];
};

/**
 * MousePosition component displays the current mouse coordinates in longitude and latitude.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function MousePosition(props: Readonly<Props>): React.ReactNode {
  const { mouseLonLat } = props;
  return (
    <div id="mouse-position">
      <span id="number">{mouseLonLat[0].toFixed(5)}</span>
      <span>,</span>
      <span id="number">{mouseLonLat[1].toFixed(5)}</span>
    </div>
  );
}
