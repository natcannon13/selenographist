async function versionNumber(){
  try{
    const response = await fetch("https://api.github.com/repos/natcannon13/selenographist/releases/latest");
    if(!response.ok){
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    const data = await response.json();
    return data.tag_name;
  }
  catch(error){
    console.error("Failed to fetch latest release", error);
  }
}

module.exports = {
    versionNumber
};