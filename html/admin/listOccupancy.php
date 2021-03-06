<?php require_once('include/config.php'); ?>
<!DOCTYPE html>
<html lang="en-us">
	<head>
		<?php require_once('include/header.php');?>
	</head>
	
	<body class="">

		<!-- HEADER -->
		<?php
				require_once('include/los-header.php');
		?>
		<!-- END HEADER -->

		<!-- Left panel : Navigation area -->
		<!-- Note: This width of the aside area can be adjusted through LESS variables -->
		<aside id="left-panel">

			<!-- User info -->
			<?php
				require_once('include/los-userInfo.php');
			?>
			<!-- end user info -->

			<!-- NAVIGATION : This navigation is also responsive-->
			<?php
				require_once('include/los-nav.php');
			?>
			<span class="minifyme" data-action="minifyMenu"> 
				<i class="fa fa-arrow-circle-left hit"></i>			</span>		</aside>
		<!-- END NAVIGATION -->

		<!-- MAIN PANEL -->
		<div id="main" role="main">

			<!-- RIBBON -->
			<div id="ribbon">

				<span class="ribbon-button-alignment"> 
					<span id="refresh" class="btn btn-ribbon" data-action="resetWidgets" data-title="refresh"  rel="tooltip" data-placement="bottom" data-original-title="<i class='text-warning fa fa-warning'></i> Warning! This will reset all your details." data-html="true">
						<i class="fa fa-refresh"></i>					</span>				</span>

				<!-- breadcrumb -->
				
				<!-- end breadcrumb -->

				<!-- You can also add more buttons to the
				ribbon for further usability

				Example below:

				<span class="ribbon-button-alignment pull-right">
				<span id="search" class="btn btn-ribbon hidden-xs" data-title="search"><i class="fa-grid"></i> Change Grid</span>
				<span id="add" class="btn btn-ribbon hidden-xs" data-title="add"><i class="fa-plus"></i> Add</span>
				<span id="search" class="btn btn-ribbon" data-title="search"><i class="fa-search"></i> <span class="hidden-mobile">Search</span></span>
				</span> -->
			</div>
			<!-- END RIBBON -->

			<!-- MAIN CONTENT -->
			<div id="content">


<div class="row">
	<div class="col-xs-12 col-sm-9 col-md-9 col-lg-9">
		<h1 class="page-title txt-color-blueDark">
			
			<!-- PAGE HEADER -->
			<i class="fa-fw fa fa-bar-chart-o"></i> 
				Facility
			<span>>  
				Occupancy			</span>		</h1>
	</div>
</div>
				
				<section id="widget-grid" class="">
                               <div class="row">
                               <article class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
						 <div class="jarviswidget well" id="">     
                                                <div id="sin-chart" class="chart has-legend"></div>
                               </div> 
                               </article>
                               </div>        
                   </section>
				<!-- widget grid -->
				<section id="widget-grid" class="">

					<!-- row -->
					<div class="row">
						
						<!-- NEW WIDGET START -->
						<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

							<!-- Widget ID (each widget will need unique ID)-->
							<div class="jarviswidget well" id="wid-id-0">
								<!-- widget options:
									usage: <div class="jarviswidget" id="wid-id-0" data-widget-editbutton="false">
									
									data-widget-colorbutton="false"	
									data-widget-editbutton="false"
									data-widget-togglebutton="false"
									data-widget-deletebutton="false"
									data-widget-fullscreenbutton="false"
									data-widget-custombutton="false"
									data-widget-collapsed="true" 
									data-widget-sortable="false"
									
								-->
								<header>
									<span class="widget-icon"> <i class="fa fa-comments"></i> </span>
									<h2>View Occupancy </h2>				
								</header>

								<div class="allGyms" >
									<ul class="gymsList">
									</ul>
								</div>
								<!-- widget div-->
								
								<div>
									
									<!-- widget edit box -->
									<div class="jarviswidget-editbox">
										<!-- This area used as dropdown edit box -->
										<input class="form-control" type="text">	
									</div>
									<!-- end widget edit box -->
									
									<!-- widget content -->
									<div class="widget-body no-padding">
										<form name="form1" id="form1" >
										<table id="example" class="display projects-table table table-striped table-bordered table-hover rooms" cellspacing="0" width="100%">
									        <thead>
									            <tr roll="row">
                                                                                        <th>#</th>
									                <th>Gym Name</th>
									                <th>Name</th>
									                <th>Male</th>
									                <th>Female</th>
									                <th>Total Occupancy</th>
									                <th>Percentage Occupancy</th>
									                
											<th>Action</th>
									            </tr>
									        </thead>
									        <tbody>
<!--												<tr class="odd" role="row">
													
													<td>
														Another Test Room
													</td>
													<td>
														Room1
													</td>
													<td>
														<span class="onoffswitch">
															<input id="st6" class="onoffswitch-checkbox" type="checkbox" name="start_interval">
															<label class="onoffswitch-label" for="st6">
																<span class="onoffswitch-inner" data-swchoff-text="OFF" data-swchon-text="ON"></span>
																<span class="onoffswitch-switch"></span>															</label>
														</span>													</td>
													<td><a class="btn btn-primary" href="/editRoom">
															
															Edit Rooms
														</a>
													</td>
												</tr>-->
											</tbody>
									    </table>
									    </form>
									</div>
									<!-- end widget content -->
								</div>
								<!-- end widget div -->
							</div>
							<!-- end widget -->
						</article>
						<!-- WIDGET END -->
					</div>
 
					<!-- end row -->

					<!-- row -->

					<div class="row">

						<!-- a blank row to get started -->
						<div class="col-sm-12">
							<!-- your contents here -->
						</div>
					</div>

					<!-- end row -->
				</section>
				<!-- end widget grid -->
			</div>
			<!-- END MAIN CONTENT -->
		</div>
		<!-- END MAIN PANEL -->


		<!-- SHORTCUT AREA : With large tiles (activated via clicking user name tag)
		Note: These tiles are completely responsive,
		you can add as many as you like
		-->
		<?php
		require_once('include/los-shortcut.php');
		?>
		<!-- END SHORTCUT AREA -->

		<!--================================================== -->

		<?php require_once('include/footer.php');?>
           <script src="<?php echo ROOT; ?>js/plugin/moment/moment.min.js"></script>
		<script src="<?php echo ROOT; ?>js/moment-range.min.js"></script>
		     <script type="text/javascript" src="http://www.parsecdn.com/js/parse-1.2.12.min.js"></script>
                <script type="text/javascript" src="js/site.js"></script>

		<script type="text/javascript">
			function checkNumber(e)
			{
				if(e.which >= 48 && e.which<=57)
				 return true;
				else 
				 return false; 
			}
			get_listOccupancy();
			getGymPercentage();
		</script>

		<!-- Your GOOGLE ANALYTICS CODE Below -->
		<script type="text/javascript">
			var _gaq = _gaq || [];
				_gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);
				_gaq.push(['_trackPageview']);
			
			(function() {
				var ga = document.createElement('script');
				ga.type = 'text/javascript';
				ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(ga, s);
			})();
			function showlist(name)
			{
				$(name).show();
			}
			function closelist(name)
			{
				$(name).hide();
			}
			var $chrt_border_color = "#efefef";
			var $chrt_grid_color = "#DDD"
			var $chrt_main = "#E24913";
			/* red       */
			var $chrt_second = "#6595b4";
			/* blue      */
			var $chrt_third = "#FF9F01";
			/* orange    */
			var $chrt_fourth = "#7e9d3a";
			/* green     */
			var $chrt_fifth = "#BD362F";
			/* dark red  */
			var $chrt_mono = "#000";
			$(document).ready(function() {

				// DO NOT REMOVE : GLOBAL FUNCTIONS!
				//pageSetUp();


				/* Sin chart */

                //var sin = [];
                var ggg = new Array();
                var uvId = currentUser.get('universityId');
                var Occ = Parse.Object.extend("university_gym");
                var qOcc = new Parse.Query(Occ);
                qOcc.equalTo('universityId',uvId);
                qOcc.find({
                	success: function(qOccRes){
                	 for(j in qOccRes)
                	 {
                	 	var gymId = qOccRes[j].id;
                	 	getDataChartGym(gymId,j,qOccRes.length);
                	 }
                	}
                })
                
                function getDataChartGym(gymId,j,qLen)
                {
                	 //alert(qLen+'|'+j);
                	 var sin = [];
                	 //alert(gymId)
                	 var Room = Parse.Object.extend("room_occupancy");
		           var q = new Parse.Query(Room);
		           var c=1;
		           var i=0;
		           //alert(noRomms);
		           var prevdate='';
		           q.equalTo("gymId", gymId);
		           q.descending('updatedAt');
		           q.include('gym');
		           q.find({
		             success: function(results){
		                if(!jQuery.isEmptyObject(results))
		                {
		                	for(i in results){
				              if(i==0)
				              {
				              	var noRomms = 0;
				               var totalPercentage = 0;
				              }
				              
				              //alert(parseInt(noRomms));
				              var room = results[i];
				              var GYM = room.get('gym');
				              //console.log(i);
				              
				              if(room)
				              {
				                  /*var total = room.get('percentage');
				                  var male = room.get('male');
				                  var female = room.get('female');
				                  var tot = parseInt(male+female);
				                  var percentage = parseInt(tot*100/total);*/
				                  date = new Date(room.updatedAt);
				                  //alert(noRomms);
				                  var per = room.get('percentage');
				                  if(prevdate)
				                  {
				                  	//alert('prev');
				                  	//console.log(moment(date).format('YYYY.MM.DD'));
				                  	//console.log(moment(prevdate).format('YYYY.MM.DD'));
				                  	if(moment(date).format('YYYY.MM.DD')==moment(prevdate).format('YYYY.MM.DD'))
				                  	{
				                  		totalPercentage = parseInt(totalPercentage+per);
				                  		noRomms++;
				                  		//console.log('Same|'+totalPercentage+'|'+noRomms);
				                  		/*if(moment(date).isAfter(moment(prevdate)))
				                  		{
				                  			sin.push([date, per]);
				                  		}*/
				                  		///alert(noRomms);
				                  	}
				                  	else if(i==0)
				                  	{
				                  		totalPercentage = parseInt(totalPercentage+per);
				                  		noRomms++;
				                  	}
				                  	else
				                  	{
				                  		//console.log('All|'+totalPercentage+'|'+noRomms);
				                  		var tt = parseInt(totalPercentage/noRomms);
				                  		sin.push([prevdate, tt]);
				                  		var totalPercentage = parseInt(per);
				                  		var noRomms = 1;
				                  		//alert(noRomms);
				                  	}
				                  }
				                  else{
				                  	//alert(per);
				                  	totalPercentage = parseInt(totalPercentage+per);
				                  	noRomms++;
				                  	//console.log('New|'+totalPercentage+'|'+noRomms);
				                  }
				                  
				                  
				                  //console.log(date);
				                  //sin.push([date, per]);
				                  //console.log(sin);
				                  prevdate = date;
				              }
				              
				          }
				          var tt = parseInt(totalPercentage/noRomms);
				          //console.log('Last|'+totalPercentage+'|'+noRomms);
				          sin.push([prevdate, tt]);
				          
				          ggg.push({'data':sin,'label':GYM.get('name')});
				          
				      }
		           	}
		           });
		           
		           if(parseInt(qLen-1)==j)
		           {
		           	//alert(qLen+j);
		           	//console.log(ggg);
		           	//getChartData(ggg);
		           	setTimeout(function() { getChartData(ggg); }, 5000);
		           }
                }
                
                
               function getChartData(ggg)
		     {
		         if ($("#sin-chart").length) 
		         {
		         console.log(ggg);
		         
		         /*var plot = $.plot($("#sin-chart"), [
		         
		         {
		                 data : sin+j,
		                 label : "Gym"
		         },{
		                 data : sin+j,
		                 label : "Gym"
		         }],*/
		         var plot = $.plot($("#sin-chart"), ggg, {
		                 series : {
		                         lines : {
		                                 show : true
		                         },
		                         points : {
		                                 show : true
		                         }
		                 },
		                 grid : {
		                         hoverable : true,
		                         clickable : false,
		                         tickColor : $chrt_border_color,
		                         borderWidth : 0,
		                         borderColor : $chrt_border_color,
		                 },
		                 tooltip : true,
		                 tooltipOpts : {
		                         //content : "Date <b>$x</b> Occupancy <span>$y</span>",
		                        	dateFormat: "%y-%m-%d",
		                         defaultTheme : false
		                 },
		                 colors : [$chrt_second, $chrt_fourth],
		                 yaxis : {
		                         min : 0,
		                         max : 100
		                 },
		                 xaxis : {
		                         mode : 'time',
		                         //timeformate:'%m/%d',
		                         min : moment().subtract(30, 'days'),
		                         max : moment()
		                 }
		         });
		         
		         $("#sin-chart").bind("plotclick", function(event, pos, item) {
				if (item) {
					$("#clickdata").text("You clicked point " + item.dataIndex + " in " + item.series.label + ".");
					plot.highlight(item.series, item.datapoint);
				}
						    });
						}
		     }
                
                                    
					
				});
		</script>
	</body>
</html>
