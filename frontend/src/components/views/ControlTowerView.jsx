import { useStore } from '../../store/useStore'
import LeftPanel from '../layout/LeftPanel'
import CenterPanel from '../layout/CenterPannel'
import RightPanel from '../layout/RightPanel'

export default function ControlTowerView() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: 0, flex: 1, overflow: 'hidden' }}>
      <LeftPanel />
      <CenterPanel />
      <RightPanel />
    </div>
  )
}
