import { Progress } from "../ui/progress";

export function Onboarding() {
	return (
		<form className="m-auto max-w-screen-md flex flex-col gap-8 bg-red-500 items-center">
			<h1>First Time Setup</h1>
			<Progress className="bg-primary w-96" value={33}/>
		</form>
	)
}