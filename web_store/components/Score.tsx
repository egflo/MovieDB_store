
import Box from "@mui/material/Box";


export function Score({ score }: { score: number }) {

     if (score === null) {
        return <></>
     }

    const adjusted_score_percentage = Math.floor((score / 10) * 100);
    const adjusted_score_percentage_string = adjusted_score_percentage.toString();

    let score_color = "green";
    if (adjusted_score_percentage < 50) {
        score_color = "red";
    }
    else if (adjusted_score_percentage < 65) {
        score_color = "orange";
    }
    else if (adjusted_score_percentage < 75) {
        score_color = "yellow";
    }

    let class_name = "c100 p" + adjusted_score_percentage_string + " small " + score_color;

      return (
          <Box className="wrapper">
              <Box className={class_name}>
                  <span>{adjusted_score_percentage}%</span>
                  <Box className="slice">
                      <Box className="bar"></Box>
                      <Box className="fill"></Box>
                  </Box>
              </Box>
          </Box>
      );
}