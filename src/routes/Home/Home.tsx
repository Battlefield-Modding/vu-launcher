import PlayVUForm from './components/PlayVU/PlayVUForm'
import PlayerCredentialsSheet from './components/PlayerCredentialsSheet/PlayerCredentialsSheet'
import ServerSheet from './components/ServerSheet/ServerSheet'

export default function Home() {
  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center bg-[url(assets/home_background.png)] bg-cover">
      <div className="m-auto flex max-w-96 flex-col justify-between gap-8 rounded-md bg-black p-8">
        <div className="flex justify-between">
          <PlayerCredentialsSheet />
          <ServerSheet />
        </div>
        <PlayVUForm />
      </div>
    </div>
  )
}
