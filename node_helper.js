/* Magic Mirror
 * Node Helper: MMM-Bromont
 *
 * By Olivier Gélinas
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var cheerio = require('cheerio');

module.exports = NodeHelper.create({

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-Bromont-Sending") {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
            // Send notification
            
			this.sendNotificationTest(payload);
		}
	},    

	// Example function send notification test
	sendNotificationTest: function(payload) {

    var conditions = [];

    request('https://www.bromontmontagne.com/conditions-detaillees/', (error, response, html) => {
      if (!error && response.statusCode == 200) {
          
        // html page
        const $ = cheerio.load(html);

        // get recap
        // var recaps = payload.recaps;

        // recaps.forEach(recap => {
        //   var recap_data = this.get_recap([...$('div[id="recap-' + recap + '"]')[0].childNodes]);
        //   conditions.push()
        // });

        var recap_versant = this.get_recap([...$('div[id="recap-versant"]')[0].childNodes]);
        var recap_remontes = this.get_recap([...$('div[id="recap-remontes"]')[0].childNodes]);
        var recap_pistes = this.get_recap([...$('div[id="recap-pistes"]')[0].childNodes]);
        var recap_alpine = this.get_recap([...$('div[id="recap-alpine"]')[0].childNodes]);
        var recap_raquette = this.get_recap([...$('div[id="recap-raquette"]')[0].childNodes]);
        var recap_stationnement = this.get_recap([...$('div[id="recap-stationnement"]')[0].childNodes]);

        var randonnee_alpine_details = this.get_randonnee_alpine_details([...$('div[id="recap-alpine"]')[0].childNodes]);
        recap_alpine["details"] = randonnee_alpine_details

        conditions.push(recap_versant);
        conditions.push(recap_remontes);
        conditions.push(recap_pistes);
        conditions.push(recap_alpine);
        conditions.push(recap_raquette);
        conditions.push(recap_stationnement);
      }

      payload = {"error": error, "response": response, "conditions": conditions};

      this.sendSocketNotification("MMM-Bromont-Receiving", payload);

    });
	},

    
  // Fetch information from Recap section
	get_recap: function(div) {
        
		div.forEach(child => {
      div_dash_resume = this.get_childrens(child, "div", "dash-resume recap clearfix");
  
      if (div_dash_resume != null) {
        div_dash_resume.forEach(child => {
          if (child.tagName === "div" && child.attribs["class"].trim() === "titre_petit") {
            title = child['children'][0]['data'].trim()
          }
  
          if (child.tagName === "div" && child.attribs["class"].trim() === "etat") {
            if (child['children'][0].tagName === "i" && child['children'][0].attribs["class"].trim() === "ico-jour") {
              day_open = child['children'][1]['children'][0]['data'];
              day_total = child['children'][2]['children'][0]['data'].replace(/\/+/g, '').trim();
            }
  
            if (child['children'][0].tagName === "i" && child['children'][0].attribs["class"].trim() === "ico-soir") {
              night_open = child['children'][1]['children'][0]['data'];
              night_total = child['children'][2]['children'][0]['data'].replace(/\/+/g, '').trim();
            }
          }
        });
      }
    });
    return {"title": title, "day_open": day_open, "day_total": day_total, "night_open": night_open, "night_total": night_total}; 
  },

  // Get Randonnée Alpine details
  get_randonnee_alpine_details: function(div) {
    var details = [];

    div.forEach(child => {
      div_dash_detail = this.get_childrens(child, "div", "dash-detail");

      if (div_dash_detail != null) {
        div_dash_detail.forEach(child => {
          div_bloc_versant = this.get_childrens(child, "div", "bloc_versant  no-header");

          if (div_bloc_versant != null) {
            div_bloc_versant.forEach(child => {
              div_bloc_content = this.get_childrens(child, "div", "bloc_content");

              if (div_bloc_content != null) {
                div_bloc_content.forEach(child => {
                  div_liste = this.get_childrens(child, "div", "liste");

                  if (div_liste != null) {
                    var detail = {};

                    div_liste.forEach(piste => {

                      if (piste.tagName === "span" && piste.attribs["class"].trim() === "legende") {
                        // console.log(piste['children'][1].attribs["class"]);
                        var legende = piste['children'][1].attribs["class"];
                        detail["legend"] = legende;
                      }

                      if (piste.tagName === "span" && piste.attribs["class"].trim() === "nom") {
                        //console.log(piste['children'][0]['data']);
                        var nom = piste['children'][0]['data'];
                        detail["name"] = nom;
                      }

                      if (piste.tagName === "span" && piste.attribs["class"].trim().includes("jour")) {
                        // console.log(piste['children'][2]['data']);
                        var status_jour = piste['children'][2]['data'].trim();
                        detail["status_day"] = status_jour;
                      }

                      if (piste.tagName === "span" && piste.attribs["class"].trim().includes("soir")) {
                        // console.log(piste['children'][2]['data']);
                        var status_soir = piste['children'][2]['data'].trim();
                        detail["status_night"] = status_soir;
                      }
                    });
                    details.push(detail);
                  }
                });
              }
            });
          }
        });
      }
    });
    return details
  },
  
  // Retreive childrens
  get_childrens: function(item, tag_name, class_name) {
    if (item.tagName === tag_name && item.attribs["class"] === class_name) {
      return item.childNodes;
    }
    else
    {
      return null;
    }
  },

});